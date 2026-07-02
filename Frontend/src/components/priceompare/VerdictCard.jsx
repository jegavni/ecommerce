import { PartyPopper, TriangleAlert } from "lucide-react";
import LoadingCard from "./LoadingCard";

const colors = {

    good_deal:
        "bg-green-50 border-green-300",

    fair_price:
        "bg-yellow-50 border-yellow-300",

    overpriced:
        "bg-red-50 border-red-300",

};

export default function VerdictCard({

    loading,
    data,

}) {

    if (loading)
        return <LoadingCard />;

    if (!data)
        return null;

    return (

        <div className={`border rounded-xl p-5 mb-8 ${colors[data.verdict]}`}>

            <div className="flex items-center gap-2 mb-3">

                {
                    data.verdict === "good_deal"
                        ? <PartyPopper />
                        : <TriangleAlert />
                }

                <h3 className="font-bold text-lg">

                    {data.verdictLabel}

                </h3>

            </div>

            <p>

                {data.insight}

            </p>

            {data.savingsTip && (

                <div className="mt-4 bg-white rounded-lg p-3">

                     {data.savingsTip}

                </div>

            )}

        </div>

    );

}