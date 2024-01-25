import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import {
  eliminar,
  obtener,
  listar,
  crear,
  actualizar
} from "../../../../api/sistema/division.api";
import DivisionListPage from "./DivisionListPage";
import DivisionEditPage from "./DivisionEditPage";

const DivisionIndexPage = () => {
  const usuario = useSelector(state => state.auth.user);

  const [divisiones, setDivisiones] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("Listado");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const classesEncabezado = useStylesEncabezado();


  async function agregarDivision(division) {

    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, Nivel, NombreNivel, Activo } = division;
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivision.toUpperCase()
      , IdClientePadre: IdClientePadre === undefined ? "" : IdClientePadre
      , IdDivisionPadre: IdDivisionPadre === undefined ? "" : IdDivisionPadre
      , Division: Division.toUpperCase()
      , Nivel: Nivel
      , NombreNivel: NombreNivel.toUpperCase()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response) handleSuccessMessages("Se registró con éxito!");
      setModoEdicion(false);
      listarDivisiones();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });

  }

  async function actualizarDivision(division) {

    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, Nivel, NombreNivel, Activo } = division;
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivision.toUpperCase()
      , IdClientePadre: IdClientePadre === undefined ? "" : IdClientePadre
      , IdDivisionPadre: IdDivisionPadre === undefined ? "" : IdDivisionPadre
      , Division: Division.toUpperCase()
      , Nivel: Nivel
      , NombreNivel: NombreNivel.toUpperCase()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(params).then(response => {
      handleSuccessMessages("Se actualizó con éxito!");
      setModoEdicion(false);
      listarDivisiones();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });

  }

  async function eliminarRegistro(division) {
    const { IdDivision, IdCliente } = division;
    await eliminar({ IdDivision: IdDivision, IdCliente: IdCliente, IdUsuario: usuario.username }).then(response => {
      handleSuccessMessages("Se eliminó con éxito!");

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });
    listarDivisiones();
  }

  async function listarDivisiones() {

    let divisiones = await listar({
      IdCliente: "%"
      , IdDivisionPadre: "%"
      , numPagina: 0
      , tamPagina: 0
    });
    setTitulo("Listado");
    setDivisiones(divisiones);

  }

  async function obtenerDivision(filtro) {
    const { IdDivision, IdCliente } = filtro;
    if (IdDivision && IdCliente) {
      let division = await obtener({ IdDivision: IdDivision, IdCliente: IdCliente });
      setDataRowEditNew({ ...division, esNuevoRegistro: false });
    }
  }

  const nuevoRegistro = () => {
    let division = { Activo: "S" };
    setDataRowEditNew({ ...division, esNuevoRegistro: true });
    setTitulo("Nuevo");
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    const { IdDivision, IdCliente } = dataRow;
    let filtro = { IdDivision: IdDivision, IdCliente: IdCliente };
    setModoEdicion(true);
    setTitulo("Editar");
    obtenerDivision(filtro);

  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo("Listado");
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarDivisiones();

  }, []);

  return (
    <>
      Sistema/División
      <div className="row">
        <div className="col-md-12">

          <Portlet className={classesEncabezado.border}>
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {("Mantenimiento de División").toUpperCase()}
                </Typography>
              </Toolbar>
            </AppBar>
            {modoEdicion && (
              <>
                <DivisionEditPage
                  divisiones={divisiones}
                  modoEdicion={modoEdicion}
                  dataRowEditNew={dataRowEditNew}
                  actualizarDivision={actualizarDivision}
                  agregarDivision={agregarDivision}
                  cancelarEdicion={cancelarEdicion}
                  titulo={titulo}
                />
                <div className="container_only">
                  <div className="float-right">
                    <ControlSwitch checked={auditoriaSwitch}
                      onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                    /><b> Datos de auditoría</b>
                  </div>
                </div>
                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

              </>
            )}
            {!modoEdicion && (
              <DivisionListPage
                divisiones={divisiones}
                editarRegistro={editarRegistro}
                eliminarRegistro={eliminarRegistro}
                nuevoRegistro={nuevoRegistro}
              />
            )}

          </Portlet>
        </div>
      </div>
    </>
  );
};

export default DivisionIndexPage;
