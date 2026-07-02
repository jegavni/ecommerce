export default function ErrorMessage({ error }) {

    return (

        <div className="bg-red-50 border border-red-300 text-red-600 rounded-xl p-4 mb-6">

            ⚠️ {error}

        </div>

    );

}