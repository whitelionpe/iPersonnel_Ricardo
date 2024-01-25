import React from 'react';

import { FormattedMessage, injectIntl } from "react-intl";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import "./LoginUserDivision.css";


const useStyles = makeStyles((theme) => ({
  fondoImagen: {
    backgroundImage: `url(new_logos/2personnel_bg.jpg)`,
    backgroundSize: "cover",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },

  clsReajustarLabelProfile: {
    color: "#000000",
    fontWeight: "700 !important",
    fontSize: "15px !important",
    marginTop: "-14px",
    marginLeft: "-1rem",
    transform: "translate(30px, 33px) scale(1)",
  },

}));


const LoginUserDivision = (props) => {

  const { intl, setLoading, FilterOpcional } = props;

  const classes = useStyles();
  const [statePerfil, setStatePerfil] = React.useState({
    idperfil: '',
  });
  const [stateSede, setStateSede] = React.useState({
    username: '',
  });

  const handleChangePerfil = (event) => {
    const name = event.target.name;
    setStatePerfil({
      ...statePerfil,
      [name]: event.target.value,
    });
  };

  const handleChangeSede = (event) => {
    const username = event.target.name;
    setStateSede({
      ...stateSede,
      [username]: event.target.value,
    });
  };


  React.useEffect(() => {
    //-> 2 ESTA LINEA PINTA EL PRIMER INGRESO EN BACKGROUD EN INICIO
    document.body.classList.add(classes.fondoImagen)
  }, []);


  return (
    <form
      id="idFormUserDivision"
      autoComplete="off"
      className="makeStyles-root-2 clsLoginFormDivision">

      <div className="form-group">

        <InputLabel shrink htmlFor="perfil-input" className="inputLabelSubTitle">
          <FormattedMessage id="CASINO.COMPANY.GROUP.TOSELECT" />
        </InputLabel>

        <InputLabel shrink htmlFor="perfil-input" className="inputLabel">
          <FormattedMessage id="CAMP.PROFILE.PROFILE" />
        </InputLabel>

        <FormControl variant="outlined" className={`${classes.formControl} idInputPerfil`}>
          {statePerfil.idperfil === "" ? (
            <InputLabel disableAnimation shrink={false} focused={false} id='idLabelProfile_'>
              {intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.PROFILE" })}
            </InputLabel>
          ) : null}

          <Select
            id='idLabelProfile'
            labelId='idLabelProfile_'
            // native
            value={statePerfil.idperfil}
            onChange={e => { props.fnSelectPerfil(e.target.value); handleChangePerfil(e) }}
            inputProps={{
              name: 'idperfil',
              id: 'perfil-input',
            }}

            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left"
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left"
              },
              getContentAnchorEl: null
            }}
          >
            {props.perfiles.map((data, index) => (
              <MenuItem key={index} value={data.IdPerfil} name="idperfil" className="clsMenuPerfil">
                {data.Perfil === undefined ? "" : data.Perfil}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

      </div>

      <div className="form-group">
        <InputLabel shrink htmlFor="division-input" className="inputLabel">
          <FormattedMessage id="AUTH.LOGIN.SEDE" />
        </InputLabel>
        <FormControl variant="outlined" className={`${classes.formControl} idInputSede`}>

          {stateSede.username === "" ? (
            <InputLabel disableAnimation shrink={false} focused={false} id='idLabelSede_'>
              {intl.formatMessage({ id: "AUTH.LOGIN.SEDE.DIVISION" })}
            </InputLabel>
          ) : null}

          <Select
            id='idLabelSede'
            labelId='idLabelSede_'
            // native
            value={stateSede.username}
            onChange={e => { props.fnSelectDivision(e.target.value); handleChangeSede(e) }}
            inputProps={{
              name: 'username',
              id: 'division-input',
            }}

            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left"
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left"
              },
              getContentAnchorEl: null
            }}

          >
            {props.divisionView.map((data, index) => (
              <MenuItem key={index} value={data.IdDivision} name="username" className="clsMenuSede">
                {data.Cliente}/{data.Division}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {(props.mensajeClaveCaduca === '') ? null : (
        <div className={classes.root}>
          <Alert severity="warning">{props.mensajeClaveCaduca}</Alert>
        </div>

      )}

    </form>
  );
};

export default injectIntl(LoginUserDivision);



