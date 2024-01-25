import React, { useEffect } from "react";
import { Paper, Breadcrumbs, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { If } from "react-router-dom";


const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1, 2, 0, 2)
    },
    link: {
        display: "flex"
    },
    icon: {
        marginRight: theme.spacing(0.5),
        width: 20,
        height: 20
    }
}));

const CustomBreadcrumbs = props => {
    const classes = useStyles();

    useEffect(() => { }, []);

    return (

        <Paper elevation={0} className={classes.root}>
            <Breadcrumbs aria-label="Breadcrumb">
                <Link color="inherit" className={classes.link}>
                    {props.Title}
                </Link>
                {props.SubMenu && (
                    <Link color="inherit" className={classes.link}>
                        {props.SubMenu}
                    </Link>
                )}
                {props.SubMenu1 && (
                    <Link color="inherit" className={classes.link}>
                        {props.SubMenu1}
                    </Link>
                )}
                <Typography color="textPrimary" className={classes.link}>
                    {/* <GrainIcon className={classes.icon} /> */}
                    {props.Subtitle}
                </Typography>
            </Breadcrumbs>
        </Paper>



    );
};

export default CustomBreadcrumbs;
