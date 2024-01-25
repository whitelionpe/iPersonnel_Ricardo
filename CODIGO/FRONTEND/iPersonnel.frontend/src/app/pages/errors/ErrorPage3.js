import React from "react";
import { toAbsoluteUrl } from "../../../_metronic";
import "../../../_metronic/_assets/sass/pages/error/error-3.scss";

export function ErrorPage3() {
  return (
    <>
      <div className="kt-grid kt-grid--ver kt-grid--root">
        <div
          className="kt-grid__item kt-grid__item--fluid kt-grid kt-error-v3"
          style={{
            backgroundImage: `url(${toAbsoluteUrl(
              "/media/error/bg3.jpg"
            )})`
          }}
        >
          <div className="kt-error_container">
            <div className="kt-error_number">
              <h1>404</h1>
            </div>
            <p className="kt-error_title kt-font-light">Cómo has llegado hasta aquí</p>  {/*How did you get here */}
            <p className="kt-error_subtitle">
              Lo sentimos, parece que no podemos encontrar la página que estás buscando {/*Sorry we can't seem to find the page you're looking for. */}
            </p>
            <p className="kt-error_description">
              Puede haber un error ortográfico en la URL ingresada, {/* There may be a misspelling in the URL entered, */}
              <br />
              o es posible que la página que está buscando ya no exista.  {/* or the page you are looking for may no longer exist. */}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
