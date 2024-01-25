import React, { useEffect } from 'react';
import { injectIntl } from "react-intl";
import { Popup } from "devextreme-react/popup";
import { Portlet } from "../../../../partials/content/Portlet";
import { listarTreeView } from "../../../../api/campamento/habitacion.api";
import { useState } from 'react';
import { handleErrorMessages } from '../../../../store/ducks/notify-messages';
import MenuTreeViewPage from '../../../../partials/content/TreeView/MenuTreeViewPage';
import { CheckBox } from 'devextreme-react/check-box';
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import WithLoandingPanel from '../../../../partials/content/withLoandingPanel';
import { Button, Popover } from 'devextreme-react';

const HabitacionTreeViewPage = (props) => {

    const { intl, data, setLoading } = props;
    const [soloPendientes, setSoloPendientes] = useState('N');
    const [menues, setMenues] = useState([]);
    var timeout = null;
    var seleccionado = {};

    const listar = async () => {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion } = data;
        const params = {
            idCliente: IdCliente,
            idDivision: IdDivision,
            idCampamento: IdCampamento,
            idModulo: IdModulo,
            idHabitacion: IdHabitacion,
            soloPendientes: soloPendientes
        };
        setLoading(true);
        try {
            const response = await listarTreeView(params);
            if (response) {
                setMenues(response);
            }
        } catch (err) {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        } finally { setLoading(false); }

    }

    const valueChanged = e => {
        if (e.value) setSoloPendientes('S');
        else setSoloPendientes('N');
    }

    const seleccionarNodo = (selectedNode) => {
        if (!timeout) {
            seleccionado = selectedNode;
            timeout = setTimeout(function () {
                timeout = null;
                seleccionado = {};
            }, 300);
        } else {
            if (selectedNode.Nivel === 1) return;
            if (seleccionado === selectedNode) {
                props.cambiarTab(selectedNode, "habitacion");
            }
        }
    }

    useEffect(() => {
        listar();
    }, [soloPendientes]);

    return <Popup
        visible={props.isVisiblePopup}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"800px"}
        title={(
            intl.formatMessage({ id: "ACTION.DETAIL" })
        ).toUpperCase()}
        onHiding={() =>
            props.setIsVisiblePopup(false)
        }
    >
        <div id="detalle">
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6} toolbar={
                <div style={{ textAlign: "end" }}>
                    <Button
                        id="habitacion_lista_arbol"
                        icon="fa fa-question-circle"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.SHOW_LEGEND" })}
                    />
                    <Popover
                        className="popoverayuda"
                        target="#habitacion_lista_arbol"
                        showTitle={true}
                        title={intl.formatMessage({ id: "COMMON.LEGEND" })}
                        showEvent="click"
                        position="bottom"
                        width="40%"
                    >
                        <div className="row" style={{ fontSize: '13px' }}>
                            <div className="col-12 col-md-6">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border" >
                                        <h5> {intl.formatMessage({ id: "COMMON.ICONS" })}</h5>
                                    </legend>
                                    <div className="row">
                                        <div className="col-12">
                                            <i className="fas fa-tag" />: {intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })}
                                        </div>
                                        <div className="col-12">
                                            <i className="fas fa-bed" />: {intl.formatMessage({ id: "CAMP.ROOM.BED" })}
                                        </div>
                                        <div className="col-12">
                                            <span>&nbsp;</span>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="col-12 col-md-6">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border" >
                                        <h5>{intl.formatMessage({ id: "COMMON.COLORS" })}</h5>
                                    </legend>
                                    <div className="row">
                                        <div className="col-12">
                                            <span className="text-bold">{intl.formatMessage({ id: "COMMON.BLACK" })}: </span> {intl.formatMessage({ id: "COMMON.STRUCTURE_COMPLETED" })}
                                        </div>
                                        <div className="col-12">
                                            <span className="text-secondary">{intl.formatMessage({ id: "COMMON.GREY" })}: </span> {intl.formatMessage({ id: "COMMON.STRUCTURE_INCOMPLETE" })}
                                        </div>
                                        <div className="col-12">
                                            <span className="text-danger">{intl.formatMessage({ id: "COMMON.RED" })}: </span> {intl.formatMessage({ id: "COMMON.INACTIVE" })}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </Popover>
                </div >
            } />
            <Portlet>
                <CheckBox defaultValue={false} text={intl.formatMessage({ id: "COMMON.SHOW_ONLY_INCOMPLETE" })} onValueChanged={valueChanged} />

                <MenuTreeViewPage
                    menus={menues}
                    modoEdicion={false}
                    seleccionarNodo={seleccionarNodo}
                    showModulo={false}
                    showButton={false}
                    height="215px"
                />
            </Portlet>
            <div className="row mt-3">
                <div className="col-12">
                    <fieldset className="scheduler-border">
                        <legend className="scheduler-border" >
                            <h5>{intl.formatMessage({ id: "COMMON.LEGEND" })} </h5>
                        </legend>
                        <div className="row mt-3">
                            <div className="col-12 col-md-6">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border" >
                                        <h5> {intl.formatMessage({ id: "COMMON.ICONS" })}</h5>
                                    </legend>
                                    <div className="row">
                                        <div className="col-12">
                                            <i className="fas fa-tag" />: {intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })}
                                        </div>
                                        <div className="col-12">
                                            <i className="fas fa-bed" />: {intl.formatMessage({ id: "CAMP.ROOM.BED" })}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="col-12 col-md-6">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border" >
                                        <h5>{intl.formatMessage({ id: "COMMON.COLORS" })}</h5>
                                    </legend>
                                    <div className="row">
                                        <div className="col-12">
                                            <span className="text-success">{intl.formatMessage({ id: "COMMON.GREEN" })}: </span> {intl.formatMessage({ id: "COMMON.STRUCTURE_COMPLETED" })}
                                        </div>
                                        <div className="col-12">
                                            <span className="text-info">{intl.formatMessage({ id: "COMMON.BLUE" })}: </span> {intl.formatMessage({ id: "COMMON.STRUCTURE_INCOMPLETE" })}
                                        </div>
                                        <div className="col-12">
                                            <span>{intl.formatMessage({ id: "COMMON.BLACK" })}: </span> {intl.formatMessage({ id: "COMMON.STRUCTURE_CREATED" })}
                                        </div>
                                        <div className="col-12">
                                            <span className="text-danger">{intl.formatMessage({ id: "COMMON.RED" })}: </span> {intl.formatMessage({ id: "COMMON.INACTIVE" })}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    </Popup>
};

export default injectIntl(WithLoandingPanel(HabitacionTreeViewPage));