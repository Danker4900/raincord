import type { Metadata } from "next";



export const metadata = {
  title: "RainCord",
  description: "Real-time communication platform",
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <div className="flex h-screen justify-center items-center">{children}</div>;
}
