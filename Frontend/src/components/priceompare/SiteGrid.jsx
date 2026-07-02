import SiteCard from "./SiteCard";
import LoadingCard from "./LoadingCard";

export default function SiteGrid({

    loading,
    sites,

}) {

    return (

        <>

            <h3 className="font-semibold mb-4">

                Where to Buy

            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <LoadingCard key={i} />
                      ))
                    : sites?.map((site, index) => (
                          <SiteCard
                              key={index}
                              site={site}
                          />
                      ))}

            </div>

        </>

    );

}