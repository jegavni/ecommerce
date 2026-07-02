import { ExternalLink } from "lucide-react";

export default function SiteCard({ site }) {

    return (

        <div className="border rounded-xl p-4 hover:shadow-lg transition">

            <img
                src={site.image}
                alt={site.title}
                className="w-full h-24 object-contain"
            />

            <h4 className="font-semibold mt-3">

                {site.name}

            </h4>

            <p className="text-sm text-gray-500 line-clamp-2 h-10">

                {site.title}

            </p>

            <p className="text-green-600 text-xl font-bold mt-3">

                ₹{site.extractedPrice.toLocaleString("en-IN")}

            </p>

            <a
                href={site.link}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex justify-center items-center gap-2 bg-black text-white rounded-lg py-2 hover:bg-gray-800"
            >

                <ExternalLink size={16} />

                Visit Store

            </a>

        </div>

    );

}