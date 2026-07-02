export default function ProductInfo({ product }) {

    if (!product) return null;

    return (

        <div className="border-b p-6">

            <p className="text-sm text-gray-500">
                Comparing
            </p>

            <h3 className="font-semibold">
                {product.title}
            </h3>

            <p className="text-green-600 font-bold mt-1">
                ₹{Number(product.price).toLocaleString("en-IN")}
            </p>

        </div>

    );

}