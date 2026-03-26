export default function Sidebar({ role, items }) {
    return (
        <div className="w-20 bg-blue-600 flex flex-col items-center py-6 gap-6 min-h-screen">
            <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {role[0]}
                </div>
            <span className="text-white text-xs font-semibold">{role}</span>
        </div>

        <div className="w-full h-px bg-blue-400" />

        {items.map((item) => (
            <button
                key={item.label}
                className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition"
            >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            </button>
        ))}
    </div>
    );
}