import { useEffect } from "react";

export default function useOutsideClick(
    ref,
    callback
) {

    useEffect(() => {

        function handler(e) {

            if (
                ref.current &&
                !ref.current.contains(e.target)
            ) {

                callback();

            }

        }

        document.addEventListener(
            "mousedown",
            handler
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handler
            );

    }, [callback]);

}