import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import Form, {
  Item,
  GroupItem
} from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import { listarEstado, listarEstadoSimple, PatterRuler, isNotEmpty, dateFormat, convertyyyyMMddToFormatDate } from "../../../../../../../../_metronic";
import { obtenerTodos as obtenerTodosLicencias } from "../../../../../../../api/sistema/licenciaConducir.api";
import ImageViewer from '../../../../../../../partials/content/ImageViewer/ImageViewer';
import CustomTabNav from '../../../../../../../partials/components/Tabs/CustomTabNav'; // Revisar si no tiene otros estilos.
import { createItem, createItemAutorizador } from '../../../../../../../partials/content/Acreditacion/DynamicColumns';

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { actualizarautorizador } from "../../../../../../../api/acreditacion/solicitud.api"
import { handleErrorMessages, handleSuccessMessages, } from "../../../../../../../store/ducks/notify-messages";
import { obtener as obtenerDetalle, downloadFile as downloadFileDetalle } from "../../../../../../../api/acreditacion/solicitudDetalle.api"
import { withRouter } from 'react-router-dom';

import {
  DataGrid,
  Column,
  Grouping as GroupingGrid,
  Paging as PagingGrid,
  Sorting
} from "devextreme-react/data-grid";
import { Tooltip } from "devextreme-react/tooltip";

import FieldsetAcreditacion from '../../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import RequestStructurePopup from "../../../../../../../partials/content/Acreditacion/RequestStructure/RequestStructurePopup";

const DetalleEditPage = (props) => {

  const classesEncabezado = useStylesEncabezado();
  const { intl, setLoading, dataMenu, modoEdicion } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const tipoDocumentos = props.tipoDocumentos;

  const [settingDataField, setSettingDataField] = useState([]);
  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20);
  const [estadoDiscapacidad, setEstadoDiscapacidad] = useState([]);
  const [valueEdad, setValueEdad] = useState(0);
  const [licenciaConducir, setLicenciaCondudir] = useState([]);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [flUpdateImage, setFlUpdateImage] = useState(false);
  const [viewpopup, setViewpopup] = useState(false);

  //Foto:
  const [currentImagePersona, setCurrentImagePersona] = useState("");

  //---------------------------------------------------------
  const [contratos, setContratos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [centroCostos, setCentroCostos] = useState([]);
  const [viewBtnContrato, setViewBtnContrato] = useState(false);
  const [selectedContract, setSelectedContract] = useState({ Asunto: '' });

  //---------------------------------------------------------
  const [mascara, setMascara] = useState("");
  const [reglas, setReglas] = useState("");

  const isRequiredAccreditation = (fieldName) => {
    let valor = settingDataField.filter(x => x.IdDato.toUpperCase() === fieldName.toUpperCase());

    if (valor.length > 0) {
      return valor[0].Obligatorio === 'S';
    }
    return false; //Si no existe configuracion no es obligatorio
  }

  const isModifiedAccreditation = (fieldName) => {
    let valor = settingDataField.filter(x => x.IdDato.toUpperCase() === fieldName.toUpperCase());

    if (valor.length > 0) {
      return modoEdicion ? valor[0].Editable === 'S' : false;
    }

    return false;//Si no existe configuracion se deshabilita
  }

  const isRequiredRuleAccreditation = (id) => {
    return modoEdicion ? false : isRequiredAccreditation(id);
  }


  //-======================================
  const [evaluarRequerido, setEvaluarRequerido] = useState(false);

  // const elementos = [
  //   { id: "idDatosGenerales", nombre: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB1" }), bodyRender: (e) => { return renderGenerales() } },
  //   { id: "idDatosPersonales", nombre: intl.formatMessage({ id: "ACCREDITATION.DATA.VEHICLE" }), bodyRender: (e) => { return renderDatosPersonales() } },
  //   { id: "idDatosEvaluar", nombre: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB3" }), bodyRender: (e) => { return renderDatosEvaluar() } }
  // ]


  const steps = [
    {
      id: "idDatosGenerales",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB1" })
    },
    {
      id: "idDatosPersonales",
      title: intl.formatMessage({ id: "ACCREDITATION.DATA.VEHICLE" })
    },
    {
      id: "idDatosEvaluar",
      title: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.TAB3" })
    }
  ];

  const validateFormDataByStepNumber = currentStep => {

    let isValidate = false;
    let message = "";

    if (!!modoEdicion) {
      return { isValidate: true, message: "" };
    }
    return { isValidate, message };
  };

  const eventoRetornar = () => {
    let { IdCompaniaContratista, IdCompaniaMandante } = props.dataRowEditNew;
    props.eventoRetornar({
      IdCompaniaContratista,
      IdCompaniaMandante
    })
    //console.log("eventoRetornarHome END  ======================");
  }



  const onValueChangedFechaNacimiento = (e) => {
    let FechaNacimiento = (new Date(e.value))
    let FechaActual = new Date()
    let edad = FechaActual.getFullYear() - FechaNacimiento.getFullYear()

    if (e.value != null) {
      setValueEdad(edad);
    }
    else {
      setValueEdad(0);
    }
  };




  const cellEstadoRender = e => {
    let estado = e.data.EstadoAprobacion;
    let css = "";
    let estado_txt = "";
    if (e.data.EstadoAprobacion.trim() === "") {
      estado = "I";
    }

    switch (estado) {
      case "I":
        css = "estado_item_incompleto";
        estado_txt = intl
          .formatMessage({ id: "COMMON.INCOMPLETE" })
          .toUpperCase();
        break;
      case "P":
        css = "estado_item_pendiente";
        estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase();
        break;
      case "O":
        css = "estado_item_observado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.OBSERVED" })
          .toUpperCase();
        break;
      case "R":
        css = "estado_item_rechazado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.REJECTED" })
          .toUpperCase();
        break;
      case "A":
        css = "estado_item_aprobado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.APPROVED" })
          .toUpperCase();
        break;
    }

    return css === "" ? (
      <div className={"estado_item_general"}>{estado_txt}</div>
    ) : estado === "P" ? (
      <div className={`estado_item_general estado_item_small ${css}`}>
        {estado_txt}
      </div>
    ) : (
      <Fragment>
        <div className="align_estado_grid">
          <div
            id={`id_${e.data.IdRequisito}_${e.data.IdDatoEvaluar}_${e.data.EstadoAprobacion}`}
            className={"icon_estado_grid"}
          >
            <i className="dx-icon-user"></i>
          </div>
          <Tooltip
            target={`#id_${e.data.IdRequisito}_${e.data.IdDatoEvaluar}_${e.data.EstadoAprobacion}`}
            showEvent="dxhoverstart"
            hideEvent="dxhoverend"
            position="left"
          >
            <div style={{ textAlign: "left" }}>
              <strong>
                {intl
                  .formatMessage({ id: "AUTH.INPUT.USERNAME" })
                  .toUpperCase()}
                :&nbsp;
              </strong>
              {e.data.UsuarioAprobacion}
              <br />
              <strong>
                {intl
                  .formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })
                  .toUpperCase()}
                :&nbsp;
              </strong>
              {e.data.FechaAprobacion}
              <br />
              <strong>
                {intl
                  .formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })
                  .toUpperCase()}
                :&nbsp;
              </strong>
              {e.data.HoraAprobacion}
            </div>
          </Tooltip>
          <div className={`estado_item_general estado_item_small ${css}`}>
            {estado_txt}
          </div>
        </div>
      </Fragment>
    );
  };

  const cellDescargaRender = e => {
    let { NombreArchivo, AdjuntarArchivo, IdRequisito, IdDatoEvaluar } = e.data;

    if (NombreArchivo.length > 0 && AdjuntarArchivo === "S") {
      return (
        <div>
          <Button
            icon="download"
            type="default"
            hint={NombreArchivo}
            id={`gbi_${e.data.IdDatoEvaluar}_${e.data.Orden}`}
            onClick={e => {
              e.event.preventDefault();
              eventoDescarga(IdRequisito, IdDatoEvaluar);
            }}
            useSubmitBehavior={true}
          //style={{ margin: "auto", display: "table" }}
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const cellDatoRender = e => {
    let { Valor, Tipo } = e.data;

    if (Tipo === "F") {
      return (
        <span>
          {isNotEmpty(Valor) ? convertyyyyMMddToFormatDate(Valor) : ""}
        </span>
      );
    } else {
      return <span>{Valor}</span>;
    }
  };


  const eventoDescarga = async (IdRequisito, IdDatoEvaluar) => {
    //eventoDescarga VB002 REQVEH01
    console.log("eventoDescarga", IdDatoEvaluar, IdRequisito);
    let id = `X|${IdRequisito}|${IdDatoEvaluar}`;
    if (id !== "") {
      await downloadFileDetalle({
        IdSolicitud: props.dataRowEditNew.IdSolicitud,
        IdFile: id
      }).then(res => {
        var a = document.createElement("a"); //Create <a>
        a.href = res.file; //Image Base64 Goes here
        a.download = res.name; //File name Here
        a.click(); //Downloaded file
      });
    }
  };


  const renderGenerales = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.DATA.VEHICLE" })}>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="IdCompaniaMandante" visible={false} />
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COMPANY.APPLY" }) }} dataField="CompaniaMandante" editorOptions={{ readOnly: true }} />
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COMPANY.CONTRACTOR" }) }} dataField="CompaniaContratista" editorOptions={{ readOnly: true }} />
            <Item dataField="IdDivision" visible={false} />
            <Item dataField="Division" label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.PLACE" }) }} editorOptions={{ readOnly: true }} />
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.PROFILE" }) }} dataField="Perfil" editorOptions={{ readOnly: true }} />
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.CONTRACT" }) }} dataField="IdContrato" editorOptions={{ readOnly: true }} />
            <GroupItem colCount={6} >
              <Item colSpan={6} label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.AFFAIR" }) }} dataField="Asunto" editorOptions={{ readOnly: true }} />
            </GroupItem>
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.UO" }) }} dataField="UnidadOrganizativa" editorOptions={{ readOnly: true }} />
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.COSTCENTER" }) }} dataField="CentroCosto" editorOptions={{ readOnly: true }} />

            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
              }}
              // disabled={!props.dataRowEditNew.esNuevoRegistro}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true
              }}
            />
            <Item
              dataField="FechaFin"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true
              }}
            />
            <Item label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.TYPE" }) }} dataField="TipoVehiculo" editorOptions={{ readOnly: true }} />
          </GroupItem >
        </Form>
      </FieldsetAcreditacion>
    );
  }
  const renderDatosPersonales = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })}>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colSpan={2} colCount={2}>
            <Item
              dataField="Placa"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PLATE" }) }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />

            <Item rowSpan={4}>
              <Fragment>
                <ImageViewer
                  defaultImage={currentImagePersona}
                  setFlUpdate={setFlUpdateImage}
                  flUpdate={flUpdateImage}
                  width={192}
                  height={192}
                  editImage={false}
                  intl={intl}
                />
              </Fragment>
            </Item>

            <Item
              dataField="Combustible"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.FUEL" })
              }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />
            <Item
              dataField="Marca"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.BRAND" })
              }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />
            <Item
              dataField="Modelo"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.MODEL" })
              }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />
            <Item
              dataField="Color"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COLOR" })
              }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />

            <Item
              dataField="Potencia"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.POWER" })
              }}
              editorOptions={{ readOnly: true }}
            />

            <Item
              dataField="Anno"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.YEAR" })
              }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />
            <Item
              dataField="Serie"
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.SERIE"
                })
              }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />

          </GroupItem>
        </Form>
      </FieldsetAcreditacion>
    );

  }
  const renderDatosEvaluar = () => {

    const grupos = props.optRequisito.filter(x => x.Tipo === 'G');
    return (
      <Fragment>
        {
          grupos.map(grupo => (
            <FieldsetAcreditacion title={(grupo.Text || "").toLocaleLowerCase()}>
              <div>
                <Form formData={props.dataRowEditNew} labelLocation={"top"} validationGroup="FormEdicion">

                  <GroupItem itemType="group" colSpan={2} colCount={2}  >
                    {
                      props.optRequisito.map((x, i) => {

                        return (props.optRequisito.Tipo !== 'G' && x.IdRequisito === grupo.Value ? createItemAutorizador(x, true, descargarArchivo, eventoEstado, true, intl) : null);

                      })
                    }
                  </GroupItem>

                </Form>
              </div>
            </FieldsetAcreditacion>
          ))
        }
      </Fragment>

    )
  }


  const descargarArchivo = async (id) => {
    if (id !== "") {
      await downloadFileDetalle({
        IdSolicitud: props.dataRowEditNew.IdSolicitud,
        IdFile: id
      }).then(res => {
        var a = document.createElement("a"); //Create <a>
        a.href = res.file; //Image Base64 Goes here
        a.download = res.name; //File name Here
        a.click(); //Downloaded file  
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), err);
      });
    }
  }


  //---------------------------------------------------------

  const eventoEstado = (data) => {
    props.dataRowEditNew[`${data.Index}|CHECK`] = data.value;
    let tempRequisitos = props.optRequisito;
    let flUpdate = false;
    for (let i = 0; i < tempRequisitos.length; i++) {
      if (tempRequisitos[i].Index === data.Index) {
        tempRequisitos[i].EstadoAprobacion = data.value;
        flUpdate = true;
        break;
      }

    }
    if (flUpdate) {
      props.setOptRequisito(tempRequisitos);
    }
  }

  useEffect(() => {

    if (props.cargarDatos) {
      cargarCombos();

      if (isNotEmpty(props.dataRowEditNew.Foto)) {
        setCurrentImagePersona(props.dataRowEditNew.Foto);
        setFlUpdateImage(true);
      }



    }

  }, [props.cargarDatos])

  const cargarCombos = async () => {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }


  const paintTitle = () => {

    return (
      <div className="title-estado-general">
        <div className="title-estado-general-bar"> {intl.formatMessage({ id: "ACCREDITATION.EDIT.REQUEST" })}
          <b>{zeroPad(props.dataRowEditNew.IdSolicitud, 8)} </b>
        </div>
        {paintState()}
      </div>
    );
  }

  function zeroPad(num, places) {
    if (num === undefined) {
      return "";
    }
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  const paintState = () => {

    let estado = '';
    let css = '';
    switch (props.dataRowEditNew.EstadoAprobacion) {
      case 'I': css = 'estado_item_incompleto'; estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
      case 'P': css = 'estado_item_pendiente'; estado = intl.formatMessage({ id: "COMMON.EARRING" }); break;
      case 'O': css = 'estado_item_observado'; estado = intl.formatMessage({ id: "COMMON.OBSERVED" }); break;
      case 'R': css = 'estado_item_rechazado'; estado = intl.formatMessage({ id: "COMMON.REJECTED" }); break;
      case 'A': css = 'estado_item_aprobado'; estado = intl.formatMessage({ id: "COMMON.APPROVED" }); break;
      default: css = 'estado_item_incompleto'; estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
    }

    return <span className={`estado_item_izq estado_item_general  ${css}`}   >{estado}</span>


  }



  const cargarParametrosFormulario = () => {
    let {
      IdSolicitud,
      Nombre,
      Apellido, Direccion, IdTipoDocumento,
      Documento, Sexo, IdEstadoCivil,
      IdTipoSangre, Alergia, IdUbigeoNacimiento,
      IdUbigeoResidencia, FechaNacimiento, TelefonoMovil,
      TelefonoFijo, Email, EmergenciaNombre,
      EmergenciaTelefono, IdPaisLicenciaConducir, IdLicenciaConducir,
      NumeroLicenciaConducir, Discapacidad, NumeroHijos,
      Observacion
    } = props.dataRowEditNew;

    //Detalle:
    let Detalle = [];

    for (let i = 0; i < props.optRequisito.length; i++) {
      let x = props.optRequisito[i];
      if ((x.Tipo != "G" && x.Tipo != "B") && x.Aprobar == 'S') {
        let Observacion = props.dataRowEditNew[`${x.Index}|OBS`];
        let EstadoAprobacion = props.dataRowEditNew[`${x.Index}|CHECK`];

        let valor = props.dataRowEditNew[x.Index];

        if (x.Tipo === "F") {
          valor = isNotEmpty(valor) ? dateFormat(valor, 'yyyyMMdd') : "";
        }

        // console.log("[1] __________________> ", valor);
        Detalle.push({
          IdCliente: perfil.IdCliente,
          IdSolicitud: 0,
          IdRequisito: x.IdRequisito,
          IdDatoEvaluar: x.Value,
          TipoRequisito: 'S',
          Valor: isNotEmpty(valor) ? valor.toUpperCase() : "",
          Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
          EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
          NombreArchivo: '',
          TipoArchivo: ''
        });
      }

    }

    const params =
    {
      IdCliente: perfil.IdCliente,
      IdSolicitud: isNotEmpty(IdSolicitud) ? IdSolicitud : 0,
      Nombre: isNotEmpty(Nombre) ? Nombre.toUpperCase() : "",
      Apellido: isNotEmpty(Apellido) ? Apellido.toUpperCase() : "",
      Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : "",
      IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : "",
      Documento: isNotEmpty(Documento) ? Documento.toUpperCase() : "",
      Sexo: isNotEmpty(Sexo) ? Sexo : "",
      IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
      IdTipoSangre: isNotEmpty(IdTipoSangre) ? IdTipoSangre : "",
      Alergia: isNotEmpty(Alergia) ? Alergia.toUpperCase() : "",
      IdUbigeoNacimiento: isNotEmpty(IdUbigeoNacimiento) ? IdUbigeoNacimiento : "",
      IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
      FechaNacimiento: isNotEmpty(FechaNacimiento) ? (new Date(FechaNacimiento)).toLocaleDateString() : "",
      TelefonoMovil: isNotEmpty(TelefonoMovil) ? TelefonoMovil : "",
      TelefonoFijo: isNotEmpty(TelefonoFijo) ? TelefonoFijo : "",
      Email: isNotEmpty(Email) ? Email.toUpperCase() : "",
      EmergenciaNombre: isNotEmpty(EmergenciaNombre) ? EmergenciaNombre.toUpperCase() : "",
      EmergenciaTelefono: isNotEmpty(EmergenciaTelefono) ? EmergenciaTelefono : "",
      IdPaisLicenciaConducir: isNotEmpty(IdPaisLicenciaConducir) ? IdPaisLicenciaConducir : "",
      IdLicenciaConducir: isNotEmpty(IdLicenciaConducir) ? IdLicenciaConducir : "",
      NumeroLicenciaConducir: isNotEmpty(NumeroLicenciaConducir) ? NumeroLicenciaConducir.toUpperCase() : "",
      Discapacidad: isNotEmpty(Discapacidad) ? Discapacidad.toUpperCase() : "",
      NumeroHijos: isNotEmpty(NumeroHijos) ? NumeroHijos : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      SolicitudCompleta: "N",
      IdUsuarioRegistro: usuario.username,
      Detalle: JSON.stringify(Detalle)
    };
    return params;
  }

  const guardarAvance = () => {
    let params = cargarParametrosFormulario();
    evento_actualizarSolicitud(params);
  }


  const evento_actualizarSolicitud = async (params) => {
    await actualizarautorizador(params)
      .then(async res => {
        viewScreeRequest('U');

        setTimeout(() => {
          eventoRetornarHome();
        }, 1000);

      })
      .catch(err => {
        setLoading(false)
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), "Ocurrió un error inesperado");


      })
      .finally(res => {
      });
  }

  const viewScreeRequest = (tipo) => {
    setLoading(false);

    if (props.dataRowEditNew.esNuevoRegistro) {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    } else {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    }

  }

  const eventoRetornarHome = () => {
    let { IdCompaniaContratista, IdCompaniaMandante } = props.dataRowEditNew;
    props.cancelarEdicion({
      IdCompaniaContratista,
      IdCompaniaMandante
    })
  }

  function retornaColor() {
    const { DiasTranscurridos } = props.dataRowEditNew;
    let color = '';
    if (!isNotEmpty(DiasTranscurridos)) {
      color = 'rgb(167, 167, 167)';
    }
    else if (DiasTranscurridos >= props.colorRojo) {
      color = 'red';
    }
    else if (DiasTranscurridos <= props.colorVerde) {
      color = 'green';
    } else if (DiasTranscurridos < props.colorRojo && DiasTranscurridos > props.colorVerde) {
      color = '#ffd400';
    }

    return color;
  }

  function retornaColorTexto() {
    const { DiasTranscurridos } = props.dataRowEditNew;
    let color = '';
    if (DiasTranscurridos < props.colorRojo && DiasTranscurridos > props.colorVerde) {
      color = 'black';
    }
    else {
      color = 'white';
    }
    return color;
  }

  const renderTiempoAcreditacion = () => {
    return (

      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colSpan={3} colCount={3} >
          <Item colSpan={3}>
            <AppBar
              position="static"
              className={classesEncabezado.secundario}
            >
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classesEncabezado.title}
                >
                  {intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.TIME" })}
                </Typography>
              </Toolbar>
            </AppBar>
          </Item>
          <Item
            dataField="FechaSolicitud"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.STARTDATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />

          <Item
            dataField="FechaAprobacion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.APPROVAL.DATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />

          <Item
            dataField="FechaProcesado"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.DATE.PROCESS" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />

          <Item
            dataField="TiempoAcreditacion"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.TIME" }) }}
            editorOptions={{
              readOnly: true,
              inputAttr: { 'style': 'background-color: ' + retornaColor() + ' ;color: ' + retornaColorTexto() + '' }
            }}
          />

          <Item />
        </GroupItem>
      </Form>

    )
  }

  return (
    <Fragment>

      <div className="row" style={{ width: "100%" }}>
        <div className="col-12">

          <PortletHeader
            classNameHead={"title-estado-general-row"}
            title={paintTitle()}
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    onClick={guardarAvance}
                    visible={false}
                  />
                  &nbsp;
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

          <PortletBody>
            <RequestStructurePopup
              steps={steps}
              validateFormDataByStepNumber={validateFormDataByStepNumber}
              eventReturnHome={eventoRetornar}
            >
              {renderGenerales()}
              {renderDatosPersonales()}
              {renderDatosEvaluar()}
            </RequestStructurePopup>
            <br></br>
            {renderTiempoAcreditacion()}
          </PortletBody>


        </div>
      </div>
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(withRouter(DetalleEditPage)));
