import React, { useState } from "react";

export const WithLoandingPanel = (WrappedComponent) => {
    function LoandingPanel(props) {
        const setLoadingState = isComponentLoading => {
            if (isComponentLoading) {
                document.getElementById("splash-screen").classList.remove("hidden");
            } else {
                document.getElementById("splash-screen").classList.add("hidden");
            }
        }
        return (
            <>
                <WrappedComponent {...props} setLoading={setLoadingState}></WrappedComponent>
            </>
        );
    }
    return LoandingPanel;
}
export default WithLoandingPanel;
