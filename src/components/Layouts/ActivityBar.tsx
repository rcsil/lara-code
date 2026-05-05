import {
	IconBrain,
	IconBug,
	IconFiles,
	IconGitBranch,
	IconSearch,
	IconSettings,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const activityItems = [
	{ labelKey: "app.activity-bar.explorer", icon: IconFiles, route: "Explorer", active: true },
	{ labelKey: "app.activity-bar.search", icon: IconSearch, active: false },
	{ labelKey: "app.activity-bar.git", icon: IconGitBranch, active: false },
	{ labelKey: "app.activity-bar.runAndDebug", icon: IconBug, active: false },
	{ labelKey: "app.activity-bar.ai", icon: IconBrain, active: false },
];

export default function ActivityBar() {
	const { t } = useTranslation();

	return (
		<aside className="flex w-14 shrink-0 flex-col items-center rounded-2xl border border-white/8 bg-[#181b22] py-2 shadow-2xl shadow-black/30">
			<nav className="flex flex-1 flex-col items-center gap-1">
				{activityItems.map(({ labelKey, icon: Icon, active }) => {
					const label = t(labelKey);

					return (
						<button
							key={labelKey}
							type="button"
							title={label}
							aria-label={label}
							className={`relative grid h-10 w-10 place-items-center rounded-xl outline-none transition-colors ${active
								? "bg-white/12 text-white shadow-inner shadow-white/5"
								: "text-zinc-500 hover:bg-white/8 hover:text-zinc-200"
								}`}
						>
							{active && (
								<span className="absolute left-0 h-5 w-0.5 rounded-r bg-[#FF2D20]" />
							)}
							<Icon size={21} stroke={1.6} />
						</button>
					);
				})}
			</nav>

			<button
				type="button"
				title={t("app.activity-bar.settings")}
				aria-label={t("app.activity-bar.settings")}
				className="grid h-10 w-10 place-items-center rounded-xl text-zinc-500 outline-none transition-colors hover:bg-white/8 hover:text-zinc-200"
			>
				<IconSettings size={21} stroke={1.6} />
			</button>
		</aside>
	);
}
