import React, { useState, useEffect } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import Box, { Item as ItemBox } from 'devextreme-react/box';
import { Button } from 'devextreme-react';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../../store/config/Styles";

const ContentPopoverAsiento = ({
  data,
  popoverInstance,
  configNewValueForItem,
  setConfiguracionAsientos,
}) => {
  const classesEncabezado = useStylesEncabezado();

  let { Asiento = '' } = data;
  (Asiento = (Asiento === '__') ? '' : Asiento);

  const [asientoData, setAsientoData] = useState({ Asiento });
  const [esAsientoValido, setEsAsientoValido] = useState({ Asiento });

  const gurdarAsiento = (e) => {
    if (e.validationGroup.validate().isValid) {
      let { Asiento = '' } = asientoData;
      Asiento = (Asiento === '__') ? '' : Asiento;
      const config = configNewValueForItem(data, 'id', { ...data, Asiento });
      setConfiguracionAsientos(config);
      popoverInstance.hide();
    }
  }

  const cancelar = () => {
    popoverInstance.hide();
  }

  useEffect(() => {
    setAsientoData({ Asiento });
  }, [data.id]);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Form formData={asientoData} className="pt-3" validationGroup="FormEdicion">
            <Item>
              <AppBar position="static" className={classesEncabezado.subTitulo}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>Asiento</Typography>
                </Toolbar>
              </AppBar>
            </Item>
            <GroupItem colCount={1}>
              <Item
                dataField="Asiento"
                isRequired={true}
                label={{ text: "Número de Asiento" }}
                editorOptions={{
                  maxLength: 3,
                  minLength: 1,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  onKeyUp: ({ event: { target: { value } } }) => setEsAsientoValido(!!value),
                  onValueChanged: ({ value }) => setEsAsientoValido(!!value),
                }}
              />
            </GroupItem>
          </Form>
          <Box
            direction="row"
            width="100%"
            className="mt-4"
          >
            <ItemBox ratio={0} baseSize="5%"></ItemBox>
            <ItemBox ratio={1}>
              <Button
                width={140}
                className="mx-auto"
                icon="check"
                text="Guardar"
                type="default"
                stylingMode="contained"
                disabled={!esAsientoValido}
                onClick={gurdarAsiento}
              />
            </ItemBox>
            <ItemBox ratio={1}>
              <Button
                width={130}
                className="default-button mx-auto"
                icon="close"
                text="Cancelar"
                type="normal"
                stylingMode="contained"
                onClick={cancelar}
                useSubmitBehavior={true}
                validationGroup="FormEdicion"
              />
            </ItemBox>
            <ItemBox ratio={0} baseSize="5%"></ItemBox>
          </Box>
        </div>
      </div>
    </>
  );
}

export default ContentPopoverAsiento;
