import React from "react";
import { toAbsoluteUrl } from "../../../_metronic";
import "../../../_metronic/_assets/sass/pages/error/error-6.scss";

export function ErrorPage6() {

  return (
    <>
      <div className="kt-grid kt-grid--ver kt-grid--root"
        style={{ height: "100%" }}
      >
        <div
          className="kt-grid__item kt-grid__item--fluid kt-grid  kt-error-v6"
          style={{
            backgroundImage: `url(${toAbsoluteUrl("/media//error/bg6.jpg")})`
          }}
        >
          <div className="kt-error_container">
            <div className="kt-error_subtitle kt-font-light">
              <h1>Oops!</h1>
            </div>

            <p className="kt-error_description kt-font-light">
            Parece que usted no tiene permiso a esta página, o su sesión a finalizado.  {/* Looks like something went wrong. */}
              <br />
              Por favor, cierre sesión y vuelva a ingresar. Si el problema persiste contactarse con el administrador.{/* We're working on it */}
            </p>


          </div>
        </div>
      </div>
    </>
  );
}
