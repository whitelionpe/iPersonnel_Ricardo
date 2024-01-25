import { prefixForStorageKeys } from '../../app/partials/components/CustomDataGrid/CustomDataGridHelper';
import { isNotEmpty } from './utils';

export const defaultPermissions = {
  flAplicaBotones: true,
  editar: false,
  eliminar: false,
  nuevo: false,
  grabar: false,
  cambiarContrato: false,
  ampliarContrato: false,
  Tabs: [true, true, true, true, true, true, true, true, true, true,true,true  ]
}

export function getButtonPermissions(arrayPermisos, superAdmin = false) {
  let nuevo = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "NUEVO").length > 0 : true;
  let grabar = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "GRABAR").length > 0 : true;
  let editar = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "EDITAR").length > 0 : true;
  let eliminar = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "ELIMINAR").length > 0 : true;
  let exportar = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "EXPORTAR").length > 0 : true;
  let cambiarContrato = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "CAMBIAR CONTRATO").length > 0 : true;
  let ampliarContrato = !superAdmin ? arrayPermisos.filter(x => x.TipoObjeto === "B" && x.Objeto == "AMPLIAR CONTRATO").length > 0 : true;
  return { nuevo, grabar, editar, eliminar, exportar, cambiarContrato, ampliarContrato }

}

export function setDisabledTabs(arrayPermisos, cantTabs) {
  let flEncontrato = false;
  let Tabs = [];
  for (let i = 0; i < cantTabs; i++) {
    let name_tab = `vertical-tab-${i}`;
    flEncontrato = arrayPermisos.filter(x => x.TipoObjeto === "T" && x.Identificador.toLowerCase() === name_tab).length > 0;
    Tabs.push(flEncontrato);
  }
  return Tabs;
}

export function getDisableTab(dataMenu, indexTab) {
  let name_tab = `vertical-tab-${indexTab}`;
  return !dataMenu.objetos.filter(x => x.TipoObjeto === "T" && x.Identificador.toLowerCase() === name_tab).length > 0;
}

export function removeAllLocalStorageCustomDatagrid() {
  const keys = [];

  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }

  let arrayDelete = keys.filter(key => key.startsWith(prefixForStorageKeys));

  for (let i = 0; i < arrayDelete.length; i++) {
    localStorage.removeItem(arrayDelete[i]);
  }
}

//////////////////////-<Configuración Campos: isRequired/isModified  >-INI-//////////////////////////////////////

export function currentItem(data, identity) {
  if (isNotEmpty(data)) {
    return data.length > 0 ? data.find(item => item.Campo.toUpperCase() === identity.toUpperCase()) : undefined;
  }
  return undefined;
}

export function isRequired(identity, data) {
  let result = currentItem(data, identity);
  return result ? (result.Obligatorio === 'S') : false;
}

export function isModified(identity, data, superAdmin = false) {
  // console.log("isModified", identity, data);
  let result = currentItem(data, identity);
  return !superAdmin ? result ? (result.Modificable === 'S') : false : true;
}

//////////////////////-<Configuración Campos: >-END-//////////////////////////////////////

export function loadScriptByURL(id, url, callback) {
  //Registrar reCaptcha invisible de Google.
  //Referencia:>> https://www.akashmittal.com/google-recaptcha-reactjs/
  const isScriptExist = document.getElementById(id);
  if (!isScriptExist) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.id = id;
    script.onload = function () {
      if (callback) callback();
    };
    document.body.appendChild(script);
  }
  if (isScriptExist && callback) callback();
}
