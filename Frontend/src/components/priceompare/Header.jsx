import { X } from "lucide-react";

export default function Header({ onClose }) {
    return (
        <div className="flex justify-between items-center border-b p-6">

            <div>

                <p className="text-xs uppercase text-gray-500 tracking-wider">
                    AI Price Intelligence
                </p>

                <h2 className="text-2xl font-bold">
                    Compare Prices
                </h2>

            </div>

            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
            >
                <X />
            </button>

        </div>
    );
}