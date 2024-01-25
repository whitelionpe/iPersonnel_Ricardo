import React, { useState, useEffect } from 'react';
import { Popup } from 'devextreme-react/popup';
//import Form, { Item, GroupItem, SimpleItem, ButtonItem, EmptyItem } from "devextreme-react/form";
//import { convertyyyyMMddToFormatDate } from '../../../../_metronic/utils/utils';
import TextArea from 'devextreme-react/text-area';
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl"; //Multi-idioma
import SelectBox from "devextreme-react/select-box";
import { useSelector } from "react-redux";

import { listarTipoDocumento } from "../../../../_metronic";
import './PersonaTextAreaPopup.css';

const PersonaTextAreaPopup = ({
  isVisiblePopupDetalle = false,
  setIsVisiblePopupDetalle,
  obtenerNumeroDocumento,
  titleHeader= "SYSTEM.DOCUMENTOTYPE.MAINTENANCE",
  titlePlaceholder='ADMINISTRATION.POPUP.MSG.ENTERDOCUMENTS',
  intl
}) => {

  //const [datosPersona, setDatosPersona] = useState("");
  const [myTextArea, setTextArea] = useState(null);
  const [IdTipoDocumento, setIdTipoDocumento] = useState("01");
  const [cantReg, setCantReg] = useState(0);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const maximoRegistros = 500;

  useEffect(() => {
    cargarCombos();
  }, []);


  const cargarCombos = async () => {
    let tipoDocumento = await listarTipoDocumento({ IdPais: perfil.IdPais });
    setTipoDocumentos(tipoDocumento);
  }

  const cambiarDatos = (e) => {
    // console.log("cambiarDatos", e);
    let arrayCadena = e.value.split('\n');
    let tot_Registros = arrayCadena.length;

    if (tot_Registros > maximoRegistros) {
      let texto = arrayCadena.slice(0, maximoRegistros).join('\n');
      tot_Registros = maximoRegistros;
      e.component.option("value", texto);
    }
    setCantReg(tot_Registros);
  }

  const cargarReferencia = (e) => {
    if (myTextArea === null) {
      setTextArea(e.component);
    }
  }

  const aceptar = () => {
    if (myTextArea !== null) {
      let codigos = myTextArea.option('value');

      if (codigos !== '') {
        let listaCodigos = codigos.split('\n').map(x => (x.trim())).filter(x => x !== '').join('|');
        myTextArea.option('value', '');
        //console.log("aceptar", codigos, listaCodigos);
        obtenerNumeroDocumento(listaCodigos, IdTipoDocumento);
      }
    }
    setIsVisiblePopupDetalle(false)
  }

  return (
    <Popup
      visible={isVisiblePopupDetalle}
      dragEnabled={false}
      closeOnOutsideClick={true}
      showTitle={true}
      width={380}
      title={( intl.formatMessage({ id: "ACTION.SEARCH" }) + " " + intl.formatMessage({ id: titleHeader })).toUpperCase()}
      onHiding={(e) => { setIsVisiblePopupDetalle(false) }}
    >
      <div className="container">
        <div className="row div_body_popup cls_popup_item">
          <div className="col-10">

            <div className="dx-field">
              <div className="dx-field-label">{intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}:</div>
              <div className="dx-field-value">
                <SelectBox
                  deferRendering={false}
                  valueExpr={"IdTipoDocumento"}
                  defaultValue={"01"}
                  displayExpr={"Alias"}
                  searchEnabled={true}
                  placeholder={"Seleccione.."}
                  showClearButton={true}
                  dataSource={tipoDocumentos}
                  onValueChanged={(e) => { setIdTipoDocumento(e.value) }}
                />
              </div>
            </div>

          </div>
          <div className="col-2">
            <Button
              icon="todo"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
              onClick={aceptar}
              useSubmitBehavior={true}
            />
          </div>
        </div>


        <div className="row">
          <div className="col-12">
            <TextArea
              height={300}
              placeholder={intl.formatMessage({ id: titlePlaceholder }).toUpperCase()}
              spellcheck={false}
              maxLength={8000}
              //value={datosPersona}
              onValueChanged={cambiarDatos}
              // value={this.state.valueForEditableTestArea}
              valueChangeEvent={"keyup focusout"}
              // onValueChanged={this.onTextAreaValueChanged}
              onInitialized={cargarReferencia}
            // onChange={onChangeTextArea}
            />

            <p>{cantReg}/{maximoRegistros} {intl.formatMessage({ id: "ADMINISTRATION.POPUP.MSG.RECORDS" })} </p>
          </div>
        </div>
      </div>

    </Popup >
  );
};

export default injectIntl(PersonaTextAreaPopup);
