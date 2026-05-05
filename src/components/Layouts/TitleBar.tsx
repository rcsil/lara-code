import { getCurrentWindow } from "@tauri-apps/api/window";
import {
	useState,
	type MouseEventHandler,
	type ReactNode,
} from "react";
import AppIcon from "../ui/AppIcon";
import {
	IconArrowsMinimize,
	IconMinus,
	IconSquare,
	IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const appWindow = getCurrentWindow();

type MenuButtonProps = {
	children: ReactNode;
	onClick?: MouseEventHandler<HTMLButtonElement>;
};

type WindowButtonProps = {
	onClick: MouseEventHandler<HTMLButtonElement>;
	children: ReactNode;
	variant?: "default" | "danger";
};

export type AppActions = {
	onNewFile: () => void;
	onOpenFile: () => void;
	onOpenFolder: () => void;
	onSaveFile: () => void;
};

const menuItems = [
	"file",
	"edit",
	"selection",
	"view",
	"terminal",
	"help",
] as const;

function MenuButton({ children, onClick }: MenuButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="h-7 rounded-lg px-2.5 text-xs font-medium text-zinc-400 outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:bg-white/10 focus-visible:text-white"
		>
			{children}
		</button>
	);
}

function WindowButton({
	onClick,
	children,
	variant
}: WindowButtonProps) {
	const hoverClass = variant === "danger" ? "hover:bg-red-500" : "hover:bg-zinc-200/20";

	return (
		<button
			type="button"
			className={`grid h-7 w-7 place-items-center rounded-full text-zinc-400 outline-none transition-colors ${hoverClass} hover:text-white focus-visible:bg-zinc-200 focus-visible:text-zinc-950`}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

type FileMenuProps = {
	actions?: AppActions;
};

function FileMenu({ actions }: FileMenuProps) {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const items = [
		{ label: t("app.actions.newFile"), shortcut: "Ctrl+N", onClick: actions?.onNewFile },
		{ label: t("app.actions.openFile"), shortcut: "Ctrl+O", onClick: actions?.onOpenFile },
		{ label: t("app.actions.openProject"), shortcut: "Ctrl+Shift+O", onClick: actions?.onOpenFolder },
		{ label: t("app.actions.saveFile"), shortcut: "Ctrl+S", onClick: actions?.onSaveFile },
	];

	return (
		<div className="relative">
			<MenuButton onClick={() => setIsOpen((value) => !value)}>
				{t("app.titleBar.menu.file")}
			</MenuButton>

			{isOpen && (
				<div className="absolute left-0 top-8 z-50 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#181b22] py-1 shadow-2xl shadow-black/40">
					{items.map((item) => (
						<button
							key={item.label}
							type="button"
							onClick={() => {
								setIsOpen(false);
								item.onClick?.();
							}}
							disabled={!item.onClick}
							className="flex h-8 w-full items-center justify-between px-3 text-left text-xs text-zinc-300 outline-none hover:bg-white/8 hover:text-white disabled:opacity-50"
						>
							<span>{item.label}</span>
							{item.shortcut && (
								<span className="font-mono text-[11px] text-zinc-500">
									{item.shortcut}
								</span>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

type TitleBarProps = {
	actions?: AppActions;
};

export function TitleBar({ actions }: TitleBarProps) {
	const [isMaximized, setIsMaximized] = useState(false);
	const { t } = useTranslation();

	async function handleMinimize() {
		await appWindow.minimize();
	}

	async function handleToggleMaximize() {
		await appWindow.toggleMaximize();
    setIsMaximized(await appWindow.isMaximized());
	}

	async function handleClose() {
		await appWindow.close();
	}

	return (
		<header
			data-tauri-drag-region
			onDoubleClick={handleToggleMaximize}
			className="flex h-10 select-none items-center justify-between bg-[#0f1117] text-sm text-zinc-200"
		>
			<div className="flex h-full min-w-0 flex-1 items-center">
				<div className="ml-3 mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-lg">
					<AppIcon className="h-5 w-5" />
				</div>
				<nav
					aria-label={t("app.titleBar.mainMenu")}
					className="flex h-full shrink-0 items-center gap-0.5"
					onDoubleClick={(event) => event.stopPropagation()}
				>
					{menuItems.map((item) => (
						item === "file" ? (
							<FileMenu key={item} actions={actions} />
						) : (
							<MenuButton key={item}>{t(`app.titleBar.menu.${item}`)}</MenuButton>
						)
					))}
				</nav>
				<div data-tauri-drag-region className="flex h-full min-w-4 flex-1 items-center justify-center px-4">
					<div className="hidden h-7 w-full max-w-md items-center justify-center rounded-xl border border-white/8 bg-black/15 text-xs text-zinc-500 sm:flex">
						Novus
					</div>
				</div>
			</div>
			<div className="mr-2 flex h-full items-center gap-1" onDoubleClick={(event) => event.stopPropagation()}>
				<WindowButton onClick={handleMinimize}>
					<IconMinus stroke={1.5} size={14} />
				</WindowButton>
				<WindowButton onClick={handleToggleMaximize}>
					{isMaximized ? (<IconArrowsMinimize stroke={1.5} size={14} />) : (<IconSquare stroke={1.5} size={13} />)}
				</WindowButton>
				<WindowButton onClick={handleClose} variant="danger">
					<IconX stroke={1.5} size={14} />
				</WindowButton>
			</div>
		</header>
	);
}
