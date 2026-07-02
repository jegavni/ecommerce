import ProductInfo from "./ProductInfo";
import VerdictCard from "./VerdictCard";
import SiteGrid from "./SiteGrid";
import ErrorMessage from "./ErrorMessage";
import Backdrop from "./Backdrop";
import { X } from "lucide-react";


export default function PriceComparePanel({
    product,
    data,
    loading,
    error,
    onClose,
    
}) {

    return (
        <>

            <Backdrop onClose={onClose} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl h-[90vh] overflow-y-auto">

    <button
      onClick={onClose}
      className="rounded-full p-2 hover:bg-gray-100 transition"
    >
      <X className="h-6 w-6"  />
    </button>
  


                <ProductInfo product={product}/>

                <div className="p-6">

                    {error && (
                        <ErrorMessage error={error}/>
                    )}

                    <VerdictCard
                        loading={loading}
                        data={data}
                    />

                    <SiteGrid
                        loading={loading}
                        sites={data?.sites}
                    />

                </div>

            </div>
        </>
    );
}