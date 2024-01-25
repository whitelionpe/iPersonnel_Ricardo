import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";

import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosTipoVehiculos } from "../../../../api/administracion/tipoVehiculo.api";
import { obtenerTodos as obtenerTodosMarcas } from "../../../../api/administracion/marca.api";
import { obtenerTodos as obtenerTodosMarcaModelo } from "../../../../api/administracion/marcaModelo.api";
import { obtenerTodos as obtenerTodosColor } from "../../../../api/administracion/color.api";

const VehiculoFilterPage = (props) => {
  const { intl } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();

  const [tipoVehiculos, setTipoVehiculos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [colores, setColores] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);

  //Filtrar Campos Adicional... TODOS, ASIGNADO, SINASIGNAR...
  const tipoVehiculosAdd = [{ IdTipoVehiculo: "", TipoVehiculo: "....TODOS." }];
  const modelosAdd = [{ IdModelo: "", Modelo: "....TODOS." }];
  const marcasAdd = [{ IdMarca: "", Marca: "....TODOS." }];
  const colorAdd = [{ IdColor: "", Color: "....TODOS." }];
  const estadoSimpleAdd = [{ Valor: "", Descripcion: "....TODOS." }];

  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple();

    let tipoVehiculo = await obtenerTodosTipoVehiculos({
      IdCliente: perfil.IdCliente,
    });
    let marcas = await obtenerTodosMarcas({ IdCliente: perfil.IdCliente });
    let modelos = await obtenerTodosMarcaModelo({
      IdCliente: perfil.IdCliente,
      IdMarca: "%",
      IdModelo: "%",
    });
    let colores = await obtenerTodosColor({ IdCliente: perfil.IdCliente });

    setTipoVehiculos([...tipoVehiculosAdd, ...tipoVehiculo]);
    setModelos([...modelosAdd, ...modelos]);
    setMarcas([...marcasAdd, ...marcas]);
    setColores([...colorAdd, ...colores]);
    setEstadoSimple([...estadoSimpleAdd, ...estadoSimples]);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  /*const onValueChanged = () => {
    props.generarFiltro(props.dataFilter);
  };*/

  const onBuscarFiltros = () => {
    props.generarFiltro(props.dataFilter);
  };

  function getFormatMessage(strId) {
    return intl.formatMessage({ id: strId });
  }

  return (
    <>
      <Form formData={props.dataFilter}>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          {/* <Item colSpan={2}>
          <AppBar position="static" className={classesEncabezado.secundario}>
            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
              <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                Filtro Adicional
              </Typography>
            </Toolbar>
          </AppBar>
        </Item> */}

          <Item
            dataField="IdTipoVehiculo"
            label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.TYPE") }}
            editorType="dxSelectBox"
            editorOptions={{
              items: tipoVehiculos,
              valueExpr: "IdTipoVehiculo",
              displayExpr: "TipoVehiculo",
              //searchEnabled: true,
              //onValueChanged: () => onValueChanged(props.gridBoxValue),
              //showClearButton: true,
              placeholder: "Seleccione..",
            }}
          />
          <Item
            dataField="IdModelo"
            label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.MODEL") }}
            editorType="dxSelectBox"
            editorOptions={{
              items: modelos,
              valueExpr: "IdModelo",
              displayExpr: "Modelo",
              // searchEnabled: true,
              // onValueChanged: () => onValueChanged(props.gridBoxValue),
              // showClearButton: true,
              placeholder: "Seleccione..",
            }}
          />
          <Item
            dataField="IdMarca"
            label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.BRAND") }}
            editorType="dxSelectBox"
            editorOptions={{
              items: marcas,
              valueExpr: "IdMarca",
              displayExpr: "Marca",
              // searchEnabled: true,
              // onValueChanged: () => onValueChanged(props.gridBoxValue),
              // showClearButton: true,
              placeholder: "Seleccione..",
            }}
          />
          <Item
            dataField="IdColor"
            label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.COLOR") }}
            editorType="dxSelectBox"
            editorOptions={{
              items: colores,
              valueExpr: "IdColor",
              displayExpr: "Color",
              // searchEnabled: true,
              // onValueChanged: () => onValueChanged(props.gridBoxValue),
              // showClearButton: true,
              placeholder: "Seleccione..",
            }}
          />
          <Item
            dataField="Activo"
            label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.STATE") }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              // onValueChanged: () => onValueChanged(props.gridBoxValue),
              // showClearButton: true,
              placeholder: "Seleccione..",
            }}
          />

          <ButtonItem
            horizontalAlignment="right"
            buttonOptions={{
              text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.SEARCH" }),
              type: "default",
              icon: "search",
              useSubmitBehavior: true,
              onClick: function () {
                onBuscarFiltros();
              },
            }}
          />
        </GroupItem>
      </Form>
      <br />
    </>
  );
};

export default injectIntl(VehiculoFilterPage);
