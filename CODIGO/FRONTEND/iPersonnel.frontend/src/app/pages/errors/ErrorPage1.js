import React from "react";
import { toAbsoluteUrl } from "../../../_metronic";
import "../../../_metronic/_assets/sass/pages/error/error-1.scss";

export function ErrorPage1() {
 
  return (
    <>
      <div className="kt-grid kt-grid--ver kt-grid--root">
        <div
          className="kt-grid__item kt-grid__item--fluid kt-grid kt-error-v1"
          style={{
            backgroundImage: `url(${toAbsoluteUrl(
              "/media/error/bg1.jpg"
            )})`
          }}
        >
          <div className="kt-error-v1__container">
            <h1 className="kt-error-v1__number">404</h1>
            <p className="kt-error-v1__desc">OOPS! Lo sentimos, parece que no podemos encontrar la página que estás buscando</p>
            {/* Something went wrong here */}
          </div>
        </div>
      </div>
    </>
  );
}
