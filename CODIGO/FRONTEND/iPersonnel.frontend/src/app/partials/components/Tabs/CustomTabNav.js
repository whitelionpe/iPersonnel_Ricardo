import React, { Fragment, useEffect, useState, useRef } from 'react';
import './CustomTabNav.css';

const CustomTabNav = ({
  id = 'tab_generico',
  elementos = [{
    id: "principal",
    nombre: 'Principal',
    icon: null,
    buttonDelete: false,
    bodyRender: (e) => { return (<div>Div Principal</div>) }
  }],
  setElementos = () => { },
  tabActivo = 0,
  setTabActivo = () => { },
  validateRequerid = false,
  evaluateRequerid = false,
  parametrosGenerales = {}//,
 
}) => {


  useEffect(() => {
    console.log("Cambio de tabs activos::::>", tabActivo);
    //console.log("CustomTabNav|elementos:", elementos);
    // className={`nav-item-body tab-pane fade ${(tabActivo == i) ? "show active" : ""}`}
  }, [tabActivo]);

  useEffect(() => {
    if (validateRequerid) {
      setTimeout(() => {

        let elementosHeader = document.getElementsByClassName('nav-item-header');

        for (let i = 0; i < elementosHeader.length; i++) {
          if (!elementosHeader[i].children[0].classList.contains('ocultar_elemento')) {
            elementosHeader[i].children[0].classList.add('ocultar_elemento');
          }

          if (evaluateRequerid) {
            //Se busca los elementos requeridos:
            let idBody = elementosHeader[i].id;
            idBody = idBody.substring(0, idBody.length - 4);
            let requeridos = document.getElementById(idBody).querySelectorAll('.dx-invalid');
            if (requeridos.length > 0) {
              elementosHeader[i].children[0].classList.remove('ocultar_elemento');
            }
          }
        }
      }, 500);
    }

  }, [evaluateRequerid]);

  const seleccionarActivo = (e) => {
    //console.log("event ->", e);
    //console.log(`--${e.target.id}--`);
    if (e.target.id === null || e.target.id === '') {
      //console.log("id nulo");
      //console.log(e.parent);
    }

    e.preventDefault();

    let idSeleccionado = e.target.id;
    let elementosHeader = document.getElementsByClassName('nav-item-header');
    let elementosBody = document.getElementsByClassName('nav-item-body');
    let indexBody = -1;

    //Remover estilos:
    for (let i = 0; i < elementosHeader.length; i++) {
      //elementosHeader[i].classList.remove('active');
      elementosHeader[i].classList.remove('dx-tab-selected');
      elementosHeader[i].classList.remove('tab-header-seleccionado');
    }

    for (let i = 0; i < elementosBody.length; i++) {
      //console.log("aa--> ", idSeleccionado, elementosBody[i].id);
      elementosBody[i].classList.remove('show');
      elementosBody[i].classList.remove('active');
      if (idSeleccionado == `${elementosBody[i].id}-tab` && indexBody == -1) {
        indexBody = i;
      }
    }
    //
    //console.log("---> id ", idSeleccionado);
    //Agregar Estilos:
    //e.target.classList.add('active');
    if (indexBody >= 0) {
      e.target.classList.add('dx-tab-selected');
      e.target.classList.add('tab-header-seleccionado');
      elementosBody[indexBody].classList.add('show');
      elementosBody[indexBody].classList.add('active');
    } else {
      console.log("No se encontro tab");
    }
    //item.classList.remove("active") //nav-item-header
  }

  const btnEliminar = (id) => {
    return <button className={"btn_eliminar_tab btn btn-alert btn-sm"} id={`sp_${id}`} onClick={() => { eliminarTab(id) }}> x</button >
  }

  const eliminarTab = (id) => {
    //console.log("Se elimina: ", id, elementos);
    //setTabActivo(0);
    let tempElementos = elementos.filter(x => (x.id != id));
    setElementos(tempElementos);

    //Dirige al primer tab creado con el id idTabGeneral-tab 
    setTimeout(() => {
      //document.getElementsByClassName('nav-item-custom')[0].children[0].click();
      document.getElementById('idTabGeneral-tab').click();
    }, 500);
    
    //deleteTab();
    //document.getElementById("idTabGeneral-tab").click();
    //$('a[rel="idTabGeneral-tab"]').trigger("click");
    //$('[href="#tabsx-idTabGeneral"]').tab('show');
    //$(".nav-link a[href=\\"+"tabsx-idTabGeneral"+"]").tab('show');

    // seleccionarActivo(document.getElementsByClassName('nav-item-custom')[0].children[0]);
    // let items = document.getElementsByClassName('nav-item-custom');
    // let itemsbody = document.getElementsByClassName('nav-item-body');
    // console.log("se eliminan");
    // for (let i = 1; i < items.length; i++) {
    //     items[i].children[0].classList.remove('dx-tab-selected');
    //     items[i].children[0].classList.remove('tab-header-seleccionado');

    //     itemsbody[i].classList.remove('show');
    //     itemsbody[i].classList.remove('active');
    // }
    // console.log("Se agregan");
    // items[0].children[0].classList.add('dx-tab-selected');
    // items[0].children[0].classList.add('tab-header-seleccionado');
    // itemsbody[0].classList.add('show');
    // itemsbody[0].classList.add('active');
    //id_958a7f7e-8543-adce-8454-b89227a7ed19
  }
  //show active

  return (
    <div>
      <ul className="nav nav-tabsx mb-3 dx-tabs tab-header-custom" id={`${id}-tab`} role="tablist">
        {
          elementos.map((x, i) => {
            return <li className="nav-item nav-item-custom" role="presentation" key={`li_${i}`} >
              {/* <a className={`nav-item-header nav-link dx-tab ${(tabActivo == i) ? "active" : ""}`} */}

              {x.icon &&
                (
                  x.icon
                )
              }

              <a style={{
                width: "120px",
                backgroundColor: x.backgroundColor ? x.backgroundColor : "",
                fontWeight: 'bold'
              }}
                className={`nav-item-header nav-link dx-tab ${(tabActivo == i) ? "dx-tab-selected tab-header-seleccionado" : ""} ${x.buttonDelete ? "tab-header-btn-eliminar-tab" : ''}`}
                id={`${x.id}-tab`}
                data-toggle="pill"
                onClick={seleccionarActivo}
                href={`#tabsx-${x.id}`}
                role="tab"
                // icon={x.icon}
                aria-controls={`tabsx-${x.id}`}
                aria-selected="true">
                {x.nombre}<span className="nav-alert-view ocultar_elemento">!</span>{(x.buttonDelete ? btnEliminar(x.id) : null)}

              </a>

            </li>
          })
        }
      </ul>
      {/* //tab-icon-header */}

      <div className="tab-content tab-body-custom" id="tabsx-tabContent">
        {
          elementos.map((x, i) => (
            <div
              key={`div_${x.id}`}
              className={`nav-item-body tab-pane fade ${(tabActivo == i) ? "show active" : ""}`}
              id={`${x.id}`}
              role="tabpanel"
              aria-labelledby={`${x.id}-tab`} >
              {x.bodyRender(parametrosGenerales)}
            </div>
          ))
        }
      </div>

    </div>
  );
};


export default CustomTabNav;
