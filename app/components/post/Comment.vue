<script setup lang="tsx">
import type { TippyComponent } from 'vue-tippy'
import type { CommentSystem } from '~/types/comment'

const appConfig = useAppConfig()
const colorMode = useColorMode()

const commentEl = useTemplateRef('comment')
const popoverEl = useTemplateRef<TippyComponent>('popover')
const popoverJumpTo = ref('')
const popoverInputEl = useTemplateRef('popover-input')
const showUndo = ref(false)

const popoverBind = ref<TippyComponent['$props']>({})

const giscusConfig = appConfig.comment.giscus
/** giscus 必填项齐全时才注入脚本，否则展示配置提示 */
const giscusConfigured = computed(() => Boolean(giscusConfig.repo && giscusConfig.repoId && giscusConfig.categoryId))

/** 评论系统选择，记忆在 localStorage；仅在挂载后读取，避免服务端与客户端水合不一致 */
const storedSystem = useLocalStorage<CommentSystem>('comment-system', appConfig.comment.default, { initOnMounted: true })
const activeSystem = computed<CommentSystem>({
	get: () => appConfig.comment.enableSwitch ? storedSystem.value : appConfig.comment.default,
	set: (value) => { storedSystem.value = value },
})

const switchItems: { value: CommentSystem, label: string, icon: string }[] = [
	{ value: 'twikoo', label: 'Twikoo', icon: 'tabler:message-dots' },
	{ value: 'giscus', label: 'Giscus', icon: 'simple-icons:github' },
]

const twikooInited = ref(false)
const giscusInited = ref(false)

/** 评论是否已真正渲染出来 / 已判定失败，用于把「静默失败」变成可见提示 */
const twikooReady = ref(false)
const twikooFailed = ref(false)
const giscusReady = ref(false)
const giscusFailed = ref(false)

/** 超过该时限仍未渲染出评论区就判定为失败 */
const COMMENT_READY_TIMEOUT = 15_000
/** 就绪状态的轮询间隔 */
const COMMENT_POLL_INTERVAL = 500

/**
 * 轮询等待评论组件真正渲染出来。
 * 脚本或后端任一处不可达时，评论区只会永远停在「评论加载中...」且控制台毫无线索（难以排查），
 * 这里在超时后给出可见提示与报错，并继续等待（迟到的成功会清掉提示）。
 */
function pollCommentReady(ready: Ref<boolean>, failed: Ref<boolean>, check: () => boolean, label: string, startedAt = Date.now()) {
	setTimeout(() => {
		if (check()) {
			ready.value = true
			failed.value = false
			return
		}
		if (!failed.value && Date.now() - startedAt > COMMENT_READY_TIMEOUT) {
			failed.value = true
			console.error(`[comment] ${label} 在 ${COMMENT_READY_TIMEOUT / 1000}s 内未渲染完成，请检查对应脚本与服务是否可达`)
		}
		pollCommentReady(ready, failed, check, label, startedAt)
	}, COMMENT_POLL_INTERVAL)
}

/** giscus 的 iframe 与脚本同源，postMessage 需指定正确 origin（支持自建/镜像 src） */
function giscusOrigin() {
	if (!import.meta.client)
		return 'https://giscus.app'
	try {
		return new URL(giscusConfig.src, window.location.origin).origin
	}
	catch {
		return 'https://giscus.app'
	}
}

function giscusTheme() {
	return colorMode.value === 'dark' ? giscusConfig.darkTheme : giscusConfig.lightTheme
}

function initTwikoo() {
	if (twikooInited.value)
		return
	twikooInited.value = true

	// <head> 中的 twikoo.min.js 未加载成功（defer 脚本在 hydration 之前就已执行完毕）
	if (!window.twikoo?.init) {
		twikooFailed.value = true
		console.error('[comment] window.twikoo 不存在：<head> 中的 twikoo.min.js 未加载成功，请检查该脚本地址是否可达')
		return
	}

	window.twikoo.init({
		envId: appConfig.twikoo?.envId,
		// 评论内代码高亮的 Prism 资源：Twikoo 默认走 cdn.jsdelivr.net（国内不稳定）
		prismCdn: appConfig.twikoo?.prismCdn,
		// twikoo 会把挂载后的元素变为 #twikoo
		el: '#twikoo',
	})

	// 脚本存在也可能因为后端不可达而一直转圈，继续观察是否真的渲染出评论区
	pollCommentReady(twikooReady, twikooFailed, () => Boolean(document.querySelector('#twikoo .tk-comments')), 'Twikoo')
}

function initGiscus() {
	if (giscusInited.value || !giscusConfigured.value)
		return

	const container = document.querySelector<HTMLElement>('.giscus')
	if (!container)
		return
	giscusInited.value = true

	const script = document.createElement('script')
	script.src = giscusConfig.src
	script.async = true
	script.crossOrigin = 'anonymous'
	// 脚本本身加载失败（域名不可达、被拦截等）时给出提示与线索
	script.addEventListener('error', () => {
		giscusFailed.value = true
		console.error(`[comment] giscus 脚本加载失败：${giscusConfig.src}`)
	})

	const attrs: Record<string, string> = {
		'data-repo': giscusConfig.repo,
		'data-repo-id': giscusConfig.repoId,
		'data-category': giscusConfig.category,
		'data-category-id': giscusConfig.categoryId,
		'data-mapping': giscusConfig.mapping,
		'data-strict': giscusConfig.strict ? '1' : '0',
		'data-reactions-enabled': giscusConfig.reactionsEnabled ? '1' : '0',
		'data-emit-metadata': giscusConfig.emitMetadata ? '1' : '0',
		'data-input-position': giscusConfig.inputPosition,
		'data-theme': giscusTheme(),
		'data-lang': giscusConfig.lang,
		'data-loading': giscusConfig.loading,
	}
	if (giscusConfig.term)
		attrs['data-term'] = giscusConfig.term

	for (const [key, value] of Object.entries(attrs))
		script.setAttribute(key, value)

	container.appendChild(script)

	// 脚本加载成功也可能因为 giscus 站点不可达而一直空白，继续观察 iframe 是否真的出现
	pollCommentReady(giscusReady, giscusFailed, () => Boolean(document.querySelector('iframe.giscus-frame')), 'giscus')
}

/** giscus 的 iframe 渲染完成后会向父窗口发消息，以此判断它真的加载出来了（而不是只拿到了脚本） */
useEventListener(window, 'message', (e) => {
	if (e.origin === giscusOrigin() && e.data?.giscus)
		giscusReady.value = true
})

/** 按需初始化：首次显示某系统时才加载其脚本，切走后用 v-show 保活避免重复请求评论 */
function activate(system: CommentSystem) {
	if (system === 'giscus')
		initGiscus()
	else
		initTwikoo()
}

onMounted(() => activate(activeSystem.value))
watch(activeSystem, activate)

/** 跟随站点明暗主题，向 giscus iframe 推送新主题 */
watch(() => colorMode.value, () => {
	if (!giscusInited.value)
		return
	const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
	iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, giscusOrigin())
})

/** 评论区链接守卫 */
useEventListener(commentEl, 'click', (e) => {
	if (!(e.target instanceof Element))
		return

	if (e.target.matches('.tk-avatar-img'))
		e.stopPropagation()

	const popoverTarget = e.target.closest('a[target="_blank"]')
	if (!(popoverTarget instanceof HTMLAnchorElement))
		return

	e.preventDefault()
	popoverEl.value?.hide()

	popoverJumpTo.value = safelyDecodeUriComponent(popoverTarget.href)
	popoverBind.value = {
		getReferenceClientRect: () => popoverTarget.getBoundingClientRect(),
		triggerTarget: popoverTarget,
	}

	nextTick(checkUndoable)
	popoverEl.value?.show()
}, { capture: true })

function checkUndoable() {
	showUndo.value = popoverInputEl.value?.textContent !== popoverJumpTo.value
}

function undo() {
	if (!popoverInputEl.value)
		return
	popoverInputEl.value.textContent = popoverJumpTo.value
	checkUndoable()
}

function confirmOpen() {
	window.open(popoverInputEl.value?.textContent, '_blank')
}

// 评论区美化样式：随评论组件一起按需加载，避免进 nuxt.config 的 css 打包全局生效。
// 置于 body 末尾（页脚位置），不阻塞首屏渲染；文档序晚于 twikoo 注入的 <style>，
// 同优先级声明下可覆盖其默认外观。
useHead({
	link: [{
		rel: 'stylesheet',
		href: '/site-res/twikoo.css',
		tagPosition: 'bodyClose',
	}],
})
</script>

<template>
<section id="comment" ref="comment" class="z-comment">
	<div class="comment-head">
		<h3 class="text-creative">
			评论区
		</h3>

		<div v-if="appConfig.comment.enableSwitch" class="comment-switch" role="group" aria-label="切换评论系统">
			<button
				v-for="item in switchItems"
				:key="item.value"
				type="button"
				class="switch-item"
				:class="{ active: item.value === activeSystem }"
				:aria-pressed="item.value === activeSystem"
				@click="activeSystem = item.value"
			>
				<Icon :name="item.icon" />
				<span>{{ item.label }}</span>
			</button>
		</div>
	</div>

	<!-- interactive 默认会把气泡移动到 triggerTarget 的父元素上 -->
	<Tooltip
		ref="popover"
		v-bind="popoverBind"
		:append-to="() => commentEl!"
		interactive
		:aria="{ expanded: false }"
		trigger="focusin"
	>
		<template #content>
			<div class="popover-confirm">
				<span
					ref="popover-input"
					class="input"
					contenteditable="plaintext-only"
					spellcheck="false"
					@input="checkUndoable"
					@keydown.enter.prevent="confirmOpen"
					v-text="popoverJumpTo"
				/>

				<button
					v-if="showUndo"
					aria-label="恢复原始内容"
					@click="undo()"
				>
					<Icon name="tabler:arrow-back-up" />
				</button>

				<ZButton
					primary
					text="访问"
					@click="confirmOpen"
				/>
			</div>
		</template>
	</Tooltip>

	<div v-show="activeSystem === 'twikoo'">
		<p v-if="twikooFailed" class="comment-hint error">
			<Icon name="tabler:alert-triangle" />
			Twikoo 评论加载失败，请刷新页面重试
		</p>

		<p v-else-if="!twikooReady" class="comment-hint">
			评论加载中...
		</p>

		<div id="twikoo" />
	</div>

	<div v-show="activeSystem === 'giscus'" class="giscus-wrap">
		<p v-if="giscusFailed" class="comment-hint error">
			<Icon name="tabler:alert-triangle" />
			Giscus 评论加载失败，请刷新页面重试
		</p>

		<p v-else-if="giscusConfigured && !giscusReady" class="comment-hint">
			评论加载中...
		</p>

		<div v-if="giscusConfigured" class="giscus" />

		<p v-else class="comment-hint">
			<Icon name="tabler:settings" />
			giscus 尚未配置，请在根目录
			<code>giscus.config.ts</code>
			中填写 repoId 与 categoryId。
		</p>
	</div>
</section>
</template>

<style scoped>
.z-comment {
	margin: 3rem 1rem;
}

.comment-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-top: 3rem;

	> h3 {
		margin: 0;
		font-size: 1.25rem;
	}
}

.comment-switch {
	display: flex;
	gap: 0.15rem;
	padding: 0.15rem;
	border: 1px solid var(--c-border);
	border-radius: 0.6rem;
	background-color: var(--c-bg-2);
	font-size: 0.8rem;

	> .switch-item {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
		padding: 0.25em 0.7em;
		border-radius: 0.45rem;
		color: var(--c-text-2);
		transition: color 0.2s, background-color 0.2s;

		&:hover {
			color: var(--c-primary);
		}

		&.active {
			background-color: var(--c-bg);
			color: var(--c-primary);
		}
	}
}

.giscus-wrap {
	margin: 2em 0;
}

.comment-hint {
	display: flex;
	align-items: center;
	gap: 0.4em;
	color: var(--c-text-3);

	&.error {
		color: var(--c-error);
	}

	> code {
		padding: 0.1em 0.3em;
		border-radius: 0.3em;
		background-color: var(--c-bg-2);
		font-family: var(--font-monospace);
	}
}

:deep(.giscus-frame) {
	width: 100%;
	border: none;
}

:deep() > [data-tippy-root] > .tippy-box {
	padding: 0;
}

.popover-confirm {
	display: flex;
	align-items: center;
	overflow-wrap: anywhere;

	> .input {
		min-width: 0;
		padding: 0.3em 0.6em;
		outline: none;
	}

	> button {
		flex-shrink: 0;
		align-self: stretch;
		padding: 0.3em;
		border-radius: 0 0.5em 0.5em 0;
	}
}

:deep(#twikoo) {
	margin: 2em 0;

	.tk-admin-container {
		position: fixed;
		z-index: calc(var(--z-index-popover) + 1);
	}

	.tk-input {
		font-family: var(--font-monospace);
	}

	.tk-avatar {
		border-radius: 50%;

		@supports (corner-shape: squircle) {
			corner-shape: superellipse(1.2);
		}
	}

	.tk-avatar.tk-clickable {
		cursor: auto;
	}

	.tk-time {
		color: var(--c-text-3);
	}

	/* 防止 a 被 overflow hidden */
	.tk-content {
		margin: -0.2em;
		padding: 0.2em;
	}

	.tk-comments-title, .tk-nick {
		font-family: var(--font-creative);
	}

	.tk-owo-emotion {
		width: auto;
		height: 1.4em;
		vertical-align: text-bottom;
	}

	.tk-extras, .tk-footer {
		font-size: 0.7em;
		color: var(--c-text-3);
	}

	.tk-replies:not(.tk-replies-expand) {
		mask-image: linear-gradient(to top, transparent, #FFF 4em);
	}

	.tk-expand {
		border-radius: 0.5em;
		transition: background-color 0.1s;
	}

	.tippy-svg-arrow > svg {
		fill: inherit;
		width: auto;
		height: auto;
	}
}

:deep(:where(.tk-preview-container,.tk-content)) {
	pre {
		overflow: auto;
		border-radius: 0.5em;
		font-size: 0.85em;
	}

	a {
		margin: -0.1em -0.2em;
		padding: 0.1em 0.2em;
		background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat center bottom / 100% 0.1em;
		color: var(--c-primary);
		transition: all 0.2s;

		&:hover {
			border-radius: 0.3em;
			background-size: 100% 100%;
		}
	}

	p {
		margin: 0.2em 0;
	}

	img {
		border-radius: 0.5em;
	}

	menu, ol, ul {
		margin: 0.5em 0;
		padding-inline-start: 1.5em;
		font-size: 0.9rem;
		list-style: revert;

		> li {
			margin: 0.2em 0;

			&::marker {
				color: var(--c-primary);
			}
		}
	}

	blockquote {
		margin: 0.5em 0;
		padding: 0.2em 0.5em;
		border-inline-start: 4px solid var(--c-border);
		border-radius: 4px;
		background-color: var(--c-bg-2);
		font-size: 0.9em;
	}
}
</style>
