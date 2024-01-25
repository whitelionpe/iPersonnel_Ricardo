import React, { useContext } from 'react';
import './RedirectSplashScreen.css';
import { Alert, AlertTitle } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { ScreenLockContext } from '../../../context/ScreenLockContext';

const useStyles = makeStyles(theme => ({
    root: {
        width: "100%",
        "& > * + *": {
            marginTop: theme.spacing(2)
        }
    }
}));

const RedirectSplashScreen = (props) => {

    const { MessageTitle, MessageBody, isOpenSplashScreen } = useContext(ScreenLockContext);


    const classes = useStyles();

    return isOpenSplashScreen ?
        (<div className="backdrop" >
                <div className="page page-lock ng-scope">
                    <div className="lock-centered clearfix">
                        <div className="lock-container">

                            <div className={classes.root}>
                                <Alert severity="warning">
                                    <AlertTitle>{MessageTitle}</AlertTitle>
                                    {MessageBody}
                                </Alert>
                            </div>

                        </div>
                    </div>
                </div>
        </div >) : null
        ;
};

export default RedirectSplashScreen;