import React from "react";
import { Form, GroupItem, Item } from 'devextreme-react/form';
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

const PersonaContratoMotivoCese = ({
    dataRowEditNew,
    intl,
    modoEdicion,
    motivoCese,
    disabledControlSwitch,
    viewControlSwith = true,
    motivoCeseSwitchDefault = false,
    motivoCeseSwitch,
    setMotivoCeseSwitch //---> ADD->2022-08-12-> variable motivoCeseSwitch se sube al componente padre con la finalidad de refrescar grupo de motivo cese.
}) => {

    //const [motivoCeseSwitch, setMotivoCeseSwitch] = useState(motivoCeseSwitchDefault);


    const switchControlCese = () => {

        return (
            <>
                <ControlSwitch
                    checked={motivoCeseSwitch}
                    onChange={e => {
                        setMotivoCeseSwitch(e.target.checked);
                        if (e.target.checked) {
                            //dataRowEditNew.IdMotivoCese = '';
                            dataRowEditNew.FechaCese = new Date();
                            dataRowEditNew.FechaFin = new Date();
                        } else {
                            dataRowEditNew.IdMotivoCese = '';
                            dataRowEditNew.FechaCese = '';
                        }
                    }}
                    disabled={disabledControlSwitch}
                />
            </>)
    }

    return (
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={viewControlSwith ? 3 : 2} >
                <Item render={switchControlCese}
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CESSATION.ACTIVITE" }) }}
                    readOnly={true}
                    editorOptions={{ readOnly: true }}
                    visible={viewControlSwith}
                >
                </Item>
                <Item
                    dataField="IdMotivoCese"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion ? motivoCeseSwitch : false}
                    editorOptions={{
                        items: motivoCese,
                        valueExpr: "IdMotivoCese",
                        displayExpr: "MotivoCese",
                        readOnly: !(modoEdicion ? motivoCeseSwitch : false)
                    }}
                />
                <Item dataField="FechaCese"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CESSATION.DATE" }) }}
                    isRequired={modoEdicion ? motivoCeseSwitch : false}
                    editorType="dxDateBox"
                    dataType="date"
                    editorOptions={{
                        //inputAttr: { 'style': 'text-transform: uppercase' },
                        displayFormat: "dd/MM/yyyy",
                        readOnly: !(modoEdicion ? motivoCeseSwitch : false),
                        onValueChanged: ((e) => {
                            dataRowEditNew.FechaFin = e.value;
                        })
                    }}
                />
            </GroupItem>
        </Form>
    );
};

export default PersonaContratoMotivoCese;