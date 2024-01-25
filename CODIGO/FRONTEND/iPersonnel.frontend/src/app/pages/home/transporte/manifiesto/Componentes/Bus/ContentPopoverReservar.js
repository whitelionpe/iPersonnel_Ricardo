import React, { useState, useEffect } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import Box, { Item as ItemBox } from 'devextreme-react/box';
import { Button } from 'devextreme-react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { customMessageHandler, handleErrorMessages, handleSuccessMessages } from "../../../../../../store/ducks/notify-messages";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";
import { service } from "../../../../../../api/transporte/manifiestoResponsable.api";
import { injectIntl } from "react-intl";
import TransporteTrabajadoresBuscar from '../../../../../../partials/components/transporte/popUps/TransporteTrabajadoresBuscar';

const TIPO_PARADERO = {
  Origen: 'ORI',
  Destino: 'DES',
};

const initialTrabajadorData = {
  CodigoTrabajador: undefined,
  NombreCompleto: undefined,
};

const ContentPopoverReservar = ({
  data,
  popoverInstance,
  trabajadores,
  cargarConfiguracionAsientos,
  intl
}) => {
  const classesEncabezado = useStylesEncabezado();
  const { IdManifiesto, FechaProgramacion, Nivel, Fila, Columna, Asiento } = data;
  const [rutaData] = useState({ IdManifiesto, Nivel, Fila, Columna });
  const [trabajadorData, setTrabajadorData] = useState(initialTrabajadorData);
  const [listParaderosOrigen, setListParaderosOrigen] = useState([]);
  const [listParaderosDestino, setListParaderosDestino] = useState([]);
  const [isVisibleBuscarTrabajadorPopup, setIsVisibleBuscarTrabajadorPopup] = useState(false);
  const [idParaderoOrigen, setIdParaderoOrigen] = useState('');
  const [idParaderoDestino, setIdParaderoDestino] = useState('');
  const [esValido, setEsValido] = useState(false);

  const messages = {
    AsignacionExitosa: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SAVESUCCESS" }),//'La asignación del pasajero se realizó con éxito!',
    TrabajadorYaAsignadoDocumentoExacto:intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NUMBERDOCUMENTWORKEREXISTS" }),// 'El número de documento ya ha sido asignado, elija otro trabajador.',
    TrabajadorYaAsignadoDocumentoEncontrado:intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NUMBERDOCUMENTWORKERSAME" }),// 'El número de documento coincide con uno ya asignado, elija otro trabajador.',
    HayMasDeUnTrabajador:intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SAMESEARCH" }),// 'Hay más de un trabajador que coincide con el criterio de búsquedad.',
    NumeroDocumento: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DIGITNUMBERDOCUMENT" }),//'Debe digitar un número de documento a buscar.',
    ElijaOtroTrabajador: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CHOOSEOTHERWORKER" }),//'Elija otro trabajador.',
    NoHayTrabajadores:intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NOTWORKER" }),// 'No se encontró ningún trabajador.',
    TrabajadorNoPermitido:intl.formatMessage({ id: "TRANSPORTE.MANIFEST.WORKERDENIED" }),// 'El trabajador no está habilitado, porque tiene al menos una Validación de Acceso vencida',
  };

  const reservar = async () => {
    if (IdManifiesto && Nivel > 0 && Fila >= 0 && Columna >= 0) {

      const { CodigoTrabajador } = trabajadorData;
      const { IdParaderoOrigen, IdParaderoDestino } = rutaData;
      await service.asignar({ 
          IdPersona: CodigoTrabajador,
          IdManifiesto,
          FechaProgramacion,
          Nivel,
          Fila,
          Columna,
          IdParaderoOrigen : IdParaderoOrigen,
          IdParaderoDestino : IdParaderoDestino,

             }).then((response) => {
        const { mensajeError } = response;
        if (!mensajeError) {
          popoverInstance.hide();
          cargarConfiguracionAsientos();
          handleSuccessMessages(messages.AsignacionExitosa);
        } else {
          customMessageHandler(mensajeError, { type: 'error' });
        }
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
    }
  }

  const cargarParaderosPorManifiesto = async () => {
    let listOrigen = [];
    let listDestino = [];

    if (IdManifiesto) {

      listOrigen = await service.listarParaderos({ IdManifiesto, Tipo: TIPO_PARADERO.Origen });
      listDestino = await service.listarParaderos({ IdManifiesto, Tipo: TIPO_PARADERO.Destino });

      if (listOrigen && listOrigen.result.length > 0) setIdParaderoOrigen(listOrigen.result[0].IdParadero);
      if (listDestino && listDestino.result.length > 0) setIdParaderoDestino(listDestino.result[listDestino.result.length - 1].IdParadero);
    }
    setListParaderosOrigen(listOrigen.result);
    setListParaderosDestino(listDestino.result);
  };

  const cancelar = () => {
    setTrabajadorData(initialTrabajadorData);
    popoverInstance.hide();
  }

  // --------------------------------------------------------------------------------------------------------
  const buscarTrabajador = async (event) => {
    if (validarTeclaEnter(event)) {
      const NumeroDocumento = getNumeroDocumento(event);
      if (!validarTrabajadorYaAsignado(NumeroDocumento)) {
        // const listaTrabajadores = await getListaTrabajadores(NumeroDocumento);
        // establecerTrabajadorElegido(NumeroDocumento, listaTrabajadores);
        // validarSiMostrarPopup(NumeroDocumento, listaTrabajadores);
      } else {
        customMessageHandler(messages.TrabajadorYaAsignadoDocumentoExacto, { displayTime: 4000 });
      }
    }
  }

  const validarTeclaEnter = (event) => {
    return event.key && event.key.toString().toUpperCase() == 'ENTER';
  }

  const getNumeroDocumento = (event) => {
    return event.target ? event.target.value : '';
  }

  const establecerTrabajadorElegido = (NumeroDocumento, listaTrabajadores) => {
    let NombreCompleto = messages.NumeroDocumento;
    let { CodigoTrabajador } = trabajadorData;
    if (NumeroDocumento) {
      NombreCompleto = messages.NoHayTrabajadores;
      if (listaTrabajadores && listaTrabajadores.length > 0) {
        if (listaTrabajadores.length == 1) {
          if (!validarTrabajadorYaAsignado(listaTrabajadores[0].NumeroDocumento)) {
            ({ NombreCompleto, CodigoTrabajador } = listaTrabajadores[0]);
          } else {
            NombreCompleto = messages.ElijaOtroTrabajador;
            customMessageHandler(messages.TrabajadorYaAsignadoDocumentoEncontrado, { displayTime: 4000 });
          }
        } else {
          NombreCompleto = messages.HayMasDeUnTrabajador;
        }
      }
    }
    setTrabajadorData({ ...trabajadorData, CodigoTrabajador, NumeroDocumento, NombreCompleto });
    validar({ CodigoTrabajador, NumeroDocumento, NombreCompleto });
  }

  const validarSiMostrarPopup = (NumeroDocumento, listaTrabajadores) => {
    if (NumeroDocumento && listaTrabajadores && listaTrabajadores.length > 1) {
      setIsVisibleBuscarTrabajadorPopup(true);
    }
  }

  const validarTrabajadorYaAsignado = (numeroDocumento) => {
    const abc = trabajadores && trabajadores.includes(numeroDocumento);
    return abc;
  }

  const mostrarPopup = () => {
    setIsVisibleBuscarTrabajadorPopup(true);
  };

  const onRowDblClickBuscarTrabajadorPopup = (e) => {
    if (e.data.Estatus > 0) {
      const { CodigoTrabajador, NumeroDocumento } = e.data;
      if (!validarTrabajadorYaAsignado(NumeroDocumento)) {
        setIsVisibleBuscarTrabajadorPopup(false);
        setTrabajadorData(e.data);
        validar({ CodigoTrabajador, NumeroDocumento });
      } else {
        customMessageHandler(messages.TrabajadorYaAsignadoDocumentoExacto, { displayTime: 4000 });
      }
    } else {
      customMessageHandler(messages.TrabajadorNoPermitido, { displayTime: 4000 });
    }
  };

  const validar = data => {
    const { CodigoTrabajador: CodigoTrabajadorCurrent, NumeroDocumento: NumeroDocumentoCurrent } = trabajadorData;
    const { IdParaderoOrigen: IdParaderoOrigenCurrent, IdParaderoDestino: IdParaderoDestinoCurrent } = rutaData;
    const { IdParaderoOrigen = IdParaderoOrigenCurrent, IdParaderoDestino = IdParaderoDestinoCurrent, CodigoTrabajador = CodigoTrabajadorCurrent, NumeroDocumento = NumeroDocumentoCurrent } = data;
    const valido = IdParaderoOrigen && IdParaderoDestino && CodigoTrabajador && NumeroDocumento;
    setEsValido(valido);
  }

  const selectTrabajador = async (datos) => {
    const { IdPersona, NombreCompleto, Documento} = datos[0];
    setTrabajadorData({NumeroDocumento: Documento,CodigoTrabajador:IdPersona,NombreCompleto : NombreCompleto});
    validar({ CodigoTrabajador:IdPersona, NumeroDocumento:Documento });
    setIsVisibleBuscarTrabajadorPopup(false);
  };
  

  const identificador = `${Nivel}.${Fila}.${Columna}`;
  // --------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (popoverInstance.isVisible) {
      setTrabajadorData({ ...trabajadorData, NumeroDocumento: '', NombreCompleto: '' });
      cargarParaderosPorManifiesto();
    } else {
      setTrabajadorData(initialTrabajadorData);
    }
  }, [popoverInstance.isVisible]);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          {
            IdManifiesto && FechaProgramacion && Nivel > 0 && Fila >= 0 && Columna >= 0 &&
            <>
              <Form formData={rutaData}>
                <Item>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SELECTIONORIGINDESTINATION" }).toUpperCase()}
                    </Typography>
                  </Toolbar>
                </AppBar>
                </Item>
                <GroupItem colCount={2}>
                  <Item dataField="IdParaderoOrigen"
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    colSpan={5}
                    editorOptions={{
                      items: listParaderosOrigen,
                      valueExpr: "IdParadero",
                      displayExpr: "Paradero",
                      searchEnabled: true,
                      placeholder: "Seleccione..",
                      showClearButton: true,
                      inputAttr: { style: "text-transform: uppercase" },
                      onValueChanged: ({ value }) => validar({ IdParaderoOrigen: value }),
                    }}
                  />
                  <Item dataField="IdParaderoDestino"
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" })}}
                    editorType="dxSelectBox"
                    isRequired={true}
                    colSpan={5}
                    editorOptions={{
                      items: listParaderosDestino,
                      valueExpr: "IdParadero",
                      displayExpr: "Paradero",
                      searchEnabled: true,
                      placeholder: "Seleccione..",
                      showClearButton: true,
                      inputAttr: { style: "text-transform: uppercase" },
                      onValueChanged: ({ value }) => validar({ IdParaderoDestino: value }),
                    }}
                  />
                </GroupItem>
              </Form>
              <Form formData={trabajadorData} className="pt-3">
                <Item>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CHOOSEAWORKER" })}</Typography>
                    </Toolbar>
                  </AppBar> 
                </Item>
                <GroupItem colCount={1}>
                  <Item 
                    dataField="NumeroDocumento"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }) }}
                    with="50"
                    editorOptions={{
                      maxLength: 20,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      onKeyDown: async ({ event }) => await buscarTrabajador(event),
                      buttons: [{
                        name: 'search',
                        location: 'after',
                        useSubmitBehavior: true,
                        options: {
                          stylingMode: 'text',
                          icon: 'search',
                          onClick: () => mostrarPopup(),
                        }
                      }]
                    }}
                  /> 
                  <Item
                    dataField="NombreCompleto"
                    hoverStateEnabled={true}
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })  }}
                    with="50"
                    editorOptions={{
                      readOnly: true,
                    }}
                  />
                </GroupItem>
              </Form>
            </>
          }

          {!IdManifiesto && <><span> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.UNDEFINEDCODE" })} </span><br /></>}
          {!FechaProgramacion && <><span> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.UNDEFINEDPROGRAMMINGDATE" })} </span><br /></>}
          {!Nivel && <><span> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.UNDEFINEDLEVELSEATS" })} </span><br /></>}
          {
            IdManifiesto && FechaProgramacion && Nivel > 0 && Fila >= 0 && Columna >= 0 &&
            <Box
              direction="row"
              width="100%"
              className="mt-4"
            >
              <ItemBox ratio={0} baseSize="20%"></ItemBox>
              <ItemBox ratio={1}>
                <Button
                  width={140}
                  className="mx-auto"
                  icon="check"
                  text={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.RESEVED" })}
                  type="default"
                  stylingMode="contained"
                  onClick={reservar}
                  visible={IdManifiesto && FechaProgramacion && Nivel > 0 && Fila >= 0 && Columna >= 0}
                  disabled={!esValido}
                />
              </ItemBox>
              <ItemBox ratio={1}>
                <Button
                  width={130}
                  className="default-button mx-auto"
                  icon="close"
                  text={intl.formatMessage({ id: "ACTION.CANCEL" })} 
                  type="normal"
                  stylingMode="contained"
                  onClick={cancelar}
                />
              </ItemBox>
              <ItemBox ratio={0} baseSize="20%"></ItemBox>
            </Box>
          }
          {
            !(IdManifiesto && FechaProgramacion && Nivel > 0 && Fila >= 0 && Columna >= 0) &&
            <Box
              direction="row"
              width="100%"
              className="mt-4"
            >
              <ItemBox ratio={1}>
                <Button
                  width={130}
                  className="default-button mx-auto"
                  icon="close"
                  text={intl.formatMessage({ id: "ACTION.CANCEL" })} 
                  type="normal"
                  stylingMode="contained"
                  onClick={cancelar}
                />
              </ItemBox>
            </Box>
          }

        {isVisibleBuscarTrabajadorPopup && (
                <TransporteTrabajadoresBuscar
                selectData={selectTrabajador}
                showPopup={{ isVisiblePopUp: isVisibleBuscarTrabajadorPopup, setisVisiblePopUp: setIsVisibleBuscarTrabajadorPopup }}
                cancelarEdicion={() => setIsVisibleBuscarTrabajadorPopup(false)}
                uniqueId={"TransporteTrabajadoresBuscar"}
                showButton={true}
                />
              )}

        </div>
      </div>
    </>
  );
}
export default injectIntl(ContentPopoverReservar);

