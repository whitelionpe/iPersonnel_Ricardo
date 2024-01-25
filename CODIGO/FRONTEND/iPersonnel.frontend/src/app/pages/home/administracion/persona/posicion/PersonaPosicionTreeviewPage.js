import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
//import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
//import { listarTreeview } from "../../../../api/administracion/posicion.api";
import { isNotEmpty } from "../../../../../../_metronic";
import Form, { Item, GroupItem } from 'devextreme-react/form';
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";


const PersonaPosicionTreeviewPage = props => {
  const { intl } = props;
  //const perfil = useSelector(state => state.perfil.perfilActual);

  const [varIdMenu, setVarIdMenu] = useState();
  const [dataFilter, setDataFilter] = useState({ IdModulo: "" });
  const [isSubMenu, setIsSubMenu] = useState(false);

  const [selected, setSelected] = useState({});

  async function cargar() {
    

  }

  function grabar(e) {
    const { IdCliente, IdDivision, IdUnidadOrganizativa, IdPosicion, Posicion } = selected;

    if (isNotEmpty(IdPosicion)) {
      props.agregarPosicion({ IdCliente, IdDivision, IdUnidadOrganizativa, IdPosicion, Posicion });
    } else {
      handleInfoMessages(intl.formatMessage({ id: "PERSON.POSITION.MUST.POSITION" }));
    }

  }

  const seleccionarNodo = async (dataRow) => {
    const { IdMenu } = dataRow;
    if (IdMenu !== varIdMenu) setVarIdMenu(IdMenu);
    setSelected(dataRow);
  }

  const treeViewSetFocusNodo = (data, idMenu) => {
    let menus = [];
    let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
    if (objIndex >= 0) data[objIndex].selected = true;
    menus.push(...data);
    return menus;
  }

  useEffect(() => {
    cargar();
  }, []);


  return (
    <>
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="plus"
              type="default"
              text={intl.formatMessage({ id: "ACTION.ACCEPT" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
                        &nbsp;
                        <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
            />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form  validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item colSpan={2}>
                <MenuTreeViewPage
                  menus={treeViewSetFocusNodo(props.posiciones, varIdMenu)}
                  modoEdicion={false}
                  dataFilter={dataFilter}
                  setDataFilter={setDataFilter}
                  isSubMenu={isSubMenu}
                  setIsSubMenu={setIsSubMenu}
                  seleccionarNodo={seleccionarNodo}
                  showModulo={false}
                  showButton={false}

                />
              </Item>

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonaPosicionTreeviewPage);
