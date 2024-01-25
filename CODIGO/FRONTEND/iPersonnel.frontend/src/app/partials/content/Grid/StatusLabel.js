import React from "react";
import { Chip, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined';

const classes = makeStyles(theme => ({
    root: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap"
    },
    chip: {
        margin: theme.spacing(1)
    }
}));

const obtenerEtiquetaCampo = rowData => {
    return rowData.OnLine === "S" ? "o" : "o";
};

const obtenerEstiloCampo = rowData => {
    let estiloCampo = {};
    switch (rowData.OnLine) {
        case "S":
            estiloCampo = { backgroundColor: "#008000", color: "green"}; 
            break;
        //case "":
        default:
            estiloCampo = { backgroundColor: "#ff0000", color: "red" };
            /*break;
        default:
            estiloCampo = { backgroundColor: "#F6EC25", color: "yellow" };*/
    }
    return estiloCampo;
};

export default function StatusLabel(cellData) {
    return (
        <Chip
            label={obtenerEtiquetaCampo(cellData.row.data)}
            style={obtenerEstiloCampo(cellData.row.data)}
            className={classes.chip}
            size="small"
        />
    );
}
