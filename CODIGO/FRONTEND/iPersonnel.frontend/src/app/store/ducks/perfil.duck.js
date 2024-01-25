import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const initialState = {
    perfilActual: {
        IdPerfil: "",
        Perfil: "",
        IdCliente: "",
        IdDivision: "",
        Cliente: "",
        Division: "",
        IdPais: "",
        Contratista: '', ResponsableContratista: '', IdCompania: ''
    },
    perfiles: [],
    menu_opciones: [],
};

export const actionTypes = {
    setPerfilActual: "SET_PERFIL_ACTUAL",
    setPerfiles: "SET_PERFILES",
    setOpciones: "SET_MENU_OPCIONES",
};

export const actions = {
    setPerfilActual: data => ({ type: actionTypes.setPerfilActual, payload: { data } }),
    setPerfiles: data => ({ type: actionTypes.setPerfiles, payload: { data } }),
    setOpciones: data => ({ type: actionTypes.setOpciones, payload: { data } })
};

export const reducer = persistReducer(
    {
        storage,
        key: "storage-perfil",
        whitelist: ["perfilActual", "perfiles", "menu_opciones"]
    },
    (state = initialState, action) => {
        switch (action.type) {
            case actionTypes.setPerfilActual:
                const perfilActual = action.payload.data;
                return { ...state, perfilActual: perfilActual };
            case actionTypes.setPerfiles:
                console.log('::::::::A');
                const perfiles = action.payload.data.slice();
                console.log('::::::::B');
                return { ...state, perfiles: perfiles };
            case actionTypes.setOpciones:
                const { menu, opciones } = action.payload.data;
                return { ...state, menu_opciones: opciones }
            default:
                return state;
        }
    }
);
