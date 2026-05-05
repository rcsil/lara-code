import React from "react";
import { TitleBar, type AppActions } from "./TitleBar";
import ActivityBar from "./ActivityBar";

type AppLayoutProps = {
	children: React.ReactNode;
	actions?: AppActions;
}

export function AppLayout({ children, actions }: AppLayoutProps) {
	return (
		<div className="flex h-screen flex-col overflow-hidden bg-[#0b1220]">
			<TitleBar actions={actions} />

			<div className="min-h-0 flex-1 overflow-hidden">
				<main className="flex h-full min-h-0 bg-[#0f1117] p-2 text-zinc-100">
					<ActivityBar />
					{children}
				</main>
			</div>
		</div>
	)
}
