import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import Form, { Item, GroupItem,PatternRule } from "devextreme-react/form";
import { handleInfoMessages } from "../../store/ducks/notify-messages";  

const CasinoMarcacionMotivoPopUp = props => {
  const { intl } = props;
 
  function aceptar() {    
console.log("props.dataRowEditNew.Motivo >> ",props.dataRowEditNew.Motivo);
console.log("props.dataRowEditNew) >> ",props.dataRowEditNew );
    
    //Validar que se ingrese un motivo
    if (props.dataRowEditNew.Motivo == undefined || props.dataRowEditNew.Motivo.length == 0 ) {   
      handleInfoMessages(intl.formatMessage({ id: "ASSINTANCE.MARKING.NO.MOTIVE" }));
      return;
    } 

    props.confirmar();
  }

  useEffect(() => { }, []);

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"225px"}
        width={"500px"}
        title={intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" }).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
         <Portlet>

         {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="todo"
                    type="default"
                    text={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                  />
                </PortletHeaderToolbar>
              }
            />
          )}

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >     
           <Item
                dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.REASON" }), }}
                colSpan={2}
                editorType="dxTextArea"
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  width: "100%",
                  height: 100,
                }}
              />

          </GroupItem>
        </Form>
         

        </Portlet>
      </Popup>
    </>
  );
};

CasinoMarcacionMotivoPopUp.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
CasinoMarcacionMotivoPopUp.defaultProps = {
  showButton: true,
  selectionMode: "row",
};
export default injectIntl(CasinoMarcacionMotivoPopUp);
