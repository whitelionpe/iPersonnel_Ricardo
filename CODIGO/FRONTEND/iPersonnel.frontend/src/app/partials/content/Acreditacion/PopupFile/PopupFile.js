import React, { Fragment, useState, useEffect } from 'react';
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";

import './PopupFile.css';

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";


const PopupFile = (props) => {

    const { intl, ListaMensaje,
        Titulo, setListaMensaje,
        IdCarga, EstadoCarga,
        setIdCarga,
        verBoton,
        eventoBoton
    } = props;


    const paintTitle = () => {

        return (
            <div className="title-estado-general">
                <div className="title-estado-general-bar title-estado-general-bar1">
                    <b>{Titulo}</b>
                </div>
                {/* {paintState()} */}

                <div className={"div-right"}>
                </div>
            </div>
        );
    }

    useEffect(() => {

        if (IdCarga != "") {
            //console.log("Se detecta cambio :::", ListaMensaje);
            //console.log("Se detecta IdCarga :::", IdCarga);
            //console.log("Se detecta EstadoCarga :::", EstadoCarga);

            for (let k = 0; k < ListaMensaje.length; k++) {
                //console.log("Dato :::", IdCarga);
                if (ListaMensaje[k].Mensaje === IdCarga) {
                    //console.log("Se actualiza estado:::", ListaMensaje[k]);
                    ListaMensaje[k].Estado = EstadoCarga;
                    break;
                }
            }
            setIdCarga("");
        } else {
            //console.log("Se limpia");
        }
    }, [IdCarga]);

    useEffect(() => {
        //console.log("Se detecta cambio Titulo :::", Titulo);
    }, [Titulo]);

    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={false}
                //showTitle={false}
                height={"300px"}
                width={"40%"}
                //title={paintTitle()}
                titleRender={paintTitle}
                onHiding={() =>
                    props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)
                }

            >
                <div className="pv-div-content">

                    <div>
                        <div className={"barra-titulo"}>                            
                           { intl.formatMessage({id:"ACCREDITATION.TITLE.POPUP.FILE"}) }
                        </div>

                        <div className={"file-barra-estados-up"}>
                            {ListaMensaje.length > 0 ? (
                                ListaMensaje.map((x, i) => (
                                    <Fragment key={"div_s" + i} >
                                        <div className="row">
                                            <div className="col-10">
                                                <span className={"texto-file"}> {x.Mensaje}</span>
                                            </div>
                                            <div className="col-2">
                                                {x.Estado === 'P' ? <div className="spinner_file"></div> :
                                                    x.Estado === 'T' ? <i className={"dx-icon-todo file-ok"}></i> :
                                                        <i className={"dx-icon-remove file-error"}></i>}
                                            </div>
                                        </div>
                                    </Fragment>
                                ))
                            ) : (
                                <span>Sin Archivos adjuntos</span>
                            )}
                        </div>

                        {verBoton ? (<>
                            <div className={"file-boton-cerrar-padre"}>
                                <div className={"file-boton-cerrar"}>
                                    {/* <input value="Cerrar" type="button" onClick={eventoBoton} /> */}

                                    <Button
                                        icon="fa fa-times-circle"
                                        text="Cerrar"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                        onClick={eventoBoton}

                                    />

                                </div>
                            </div>
                        </>) : null}

                        {/* <i className={"dx-icon-remove"}></i>
                        <i className={"dx-icon-todo"}></i>
                        <i className={"dx-icon-pulldown"}></i>
                        <div className="spinner_file"></div> */}
                    </div>
                </div>

            </Popup>
        </>
    );
};



PopupFile.propTypes = {
    showButton: PropTypes.bool,
    selectionMode: PropTypes.string,
    uniqueId: PropTypes.string,
    IdCompaniaMandante: PropTypes.string
};
PopupFile.defaultProps = {
    showButton: false,
    selectionMode: "row",
    uniqueId: "PopupFile",
    IdCompaniaMandante: ""
};

export default injectIntl(WithLoandingPanel(PopupFile));
