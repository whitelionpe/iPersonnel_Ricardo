import React, { useState, useEffect } from 'react';
import { Popup } from 'devextreme-react/popup';
import TextArea from 'devextreme-react/text-area';
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl"; //Multi-idioma
import SelectBox from "devextreme-react/select-box";
import './PersonaTextAreaPopup.css';

const PersonaTextAreaCodigosPopup = ({
  isVisiblePopupDetalle = false,
  setIsVisiblePopupDetalle,
  obtenerCodigoIngresado,
  titleHeader= 'ASSISTANCE.REPORT.ENTER.CODE.PLANILLA',
  titlePlaceholder ='ASSISTANCE.REPORT.PLACE.HOLDER',
  intl
}) => {

  const [myTextArea, setTextArea] = useState(null);
  const [cantReg, setCantReg] = useState(0);
  const maximoRegistros = 500;

  useEffect(() => {
   
  }, []);


 

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
        obtenerCodigoIngresado(listaCodigos);
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
      title={( intl.formatMessage({ id: titleHeader }) ).toUpperCase()}
      onHiding={(e) => { setIsVisiblePopupDetalle(false) }}
    >
      <div className="container">
        <div className="row div_body_popup cls_popup_item">
          <div className="col-10">          

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
              placeholder={intl.formatMessage({ id: titlePlaceholder }).toUpperCase() }
              spellcheck={false}
              maxLength={8000}
              onValueChanged={cambiarDatos}
              valueChangeEvent={"keyup focusout"}
              onInitialized={cargarReferencia}
            />
            <p>{cantReg}/{maximoRegistros} {intl.formatMessage({ id: "ADMINISTRATION.POPUP.MSG.RECORDS" })} </p>
          </div>
        </div>
      </div>

    </Popup >
  );
};

export default injectIntl(PersonaTextAreaCodigosPopup);
