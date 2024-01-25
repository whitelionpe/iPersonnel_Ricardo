import React, { useEffect, useState } from "react";
import "./CustomTabNav.css";
import CustomTabNavBody from "./CustomTabNavBody";
import CustomTabNavHeader from "./CustomTabNavHeader";

const CustomTabNav = ({
  id = "tab_generico",
  elementos = [
    {
      id: "principal",
      nombre: "Principal",
      icon: null,
      buttonDelete: false,
      bodyRender: e => {
        return <div>Div Principal</div>;
      }
    }
  ],
  setElementos = () => {},
  defaultTabActive = 0,
  validateRequerid = false,
  evaluateRequerid = false,
  eventDeleteChildren = () => {},
  children = [],
  cssClassBody = "",
  cssClassHeader = ""
}) => {
  const [currentTab, setCurrentTab] = useState(defaultTabActive);

  useEffect(() => {
    if (validateRequerid) {
      setTimeout(() => {
        let elementosHeader = document.getElementsByClassName(
          "nav-item-header"
        );

        for (let i = 0; i < elementosHeader.length; i++) {
          if (
            !elementosHeader[i].children[0].classList.contains(
              "ocultar_elemento"
            )
          ) {
            elementosHeader[i].children[0].classList.add("ocultar_elemento");
          }

          if (evaluateRequerid) {
            //Se busca los elementos requeridos:
            let idBody = elementosHeader[i].id;
            idBody = idBody.substring(0, idBody.length - 4);
            let requeridos = document
              .getElementById(idBody)
              .querySelectorAll(".dx-invalid");
            if (requeridos.length > 0) {
              elementosHeader[i].children[0].classList.remove(
                "ocultar_elemento"
              );
            }
          }
        }
      }, 500);
    }
  }, [evaluateRequerid]);

  const seleccionarActivo = index => {
    console.log("event ->", index);
    setCurrentTab(index);
  };

  const eliminarTab = id => {
    console.log("Se elimina: ", id, elementos);

    eventDeleteChildren(id);
  };
  //show active

  // console.log("RenderTabs", { elementos });

  return elementos.length !== children.length ? null : (
    <div style={{ width: "100%" }}>
      <CustomTabNavHeader
        id={id}
        tabElements={elementos}
        currentTab={currentTab}
        eventDeleteTab={eliminarTab}
        eventSelectedTab={seleccionarActivo}
        cssClassHeader={cssClassHeader}
      />
      {/* //tab-icon-header */}

      <div className="tab-content tab-body-custom" id="tabsx-tabContent">
        {children.map((x, i) => {
          let newId = `${i}Key_Tab`;
          return (
            <CustomTabNavBody
              key={`CTNB_${newId}`}
              id={elementos[i].id}
              currentTab={currentTab}
              index={i}
              cssClassBody={cssClassBody}
            >
              {x}
            </CustomTabNavBody>
          );
        })}
      </div>
    </div>
  );
};
export default CustomTabNav;
