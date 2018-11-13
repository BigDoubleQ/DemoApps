/*
 * Copyright (C) 2016. All Rights Reserved.
 *
 * @author  Arno Zhang
 * @email   zyfgood12@163.com
 * @date    2016/06/22
 * public/js/bundle.js 是通过 app/appEntry.js 生成而来，所以，appEntry.js 文件主要负责 HTML 页面渲染——我们通过 React 来实现它。
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

const events = window.require('events');
const path = window.require('path');
const fs = window.require('fs');
const ffi = window.require('ffi');
const ref = window.require('ref');



const electron = window.require('electron');
const {ipcRenderer, shell} = electron;
const {dialog} = electron.remote;

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';


let muiTheme = getMuiTheme({
    fontFamily: 'Microsoft YaHei'
});

class MainWindow extends React.Component {

    constructor(props) {
        super(props);
        injectTapEventPlugin();

        this.state = {
            userName: "test log :",
            password: null
        };
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={styles.root}>
                    {/*<object id=rd codeBase="comRD800.cab" WIDTH="0" HEIGHT="0" classid="clsid:638B238E-EB84-4933-B3C8-854B86140668"></object>*/}
                    {/*<img style={styles.icon} src='public/img/app-icon.png'/>

                    <TextField
                        hintText='请输入用户名'
                        value={this.state.userName}
                        onChange={(event) => {this.setState({userName: event.target.value})}}/>
                    <TextField
                        hintText='请输入密码'
                        type='password'
                        value={this.state.password}
                        onChange={(event) => {this.setState({password: event.target.value})}}/>

                    <div style={styles.buttons_container}>
                        <RaisedButton
                            label="登录" primary={true}
                            onClick={this._handleLogin.bind(this)}/>*/}

                        <RaisedButton
                            label="测试卡片" primary={false} style={{marginLeft: 60}}
                            onClick={this._handleRegistry.bind(this)}/>
                        {this.state.userName}
                    {/*</div>*/}
                </div>
            </MuiThemeProvider>
        );
    }

    _handleLogin() {
        let options = {
            type: 'info',
            buttons: ['确定'],
            title: '登录',
            message: this.state.userName,
            defaultId: 0,
            cancelId: 0
        };

        dialog.showMessageBox(options, (response) => {
            if (response == 0) {
                console.log('OK pressed!');
            }
        });
    }
    _handleRegistryTest(){
        //var iopath = path.join("E:\\09.Project\\02.PanMSP\\D8\\D8\\win64-dll", '/dcrfrd.dll');
        console.log(path.toString());
        var cardDll = ffi.Library('./win64-dll/dcrfrd.dll', {
            "dc_init": [ 'int16', ['int16','long' ] ]
        });
        var retData = cardDll.dc_init(100,9600);
        console.log(retData);
    }
    _handleRegistry() {
        var iopath = path.join("E:\\09.Project\\02.PanMSP\\D8\\D8\\win64-dll", '/dcrfrd.dll');
        var rd = ffi.Library(iopath, {
            "dc_init": [ 'byte', ['byte','long' ]],
            "dc_config_card":['int16',['int16','byte']],
            "dc_card":['int16',['int16','string',ref.refType('ulong')]],
            "dc_exit":['int16',['int16']],
            "dc_pro_reset":['int16',['int16',ref.refType('byte'),ref.refType('byte')]],
            "dc_pro_command":['int16',['int16','byte',ref.refType('uchar'),ref.refType('uchar'),ref.refType('uchar'),'byte']],
            "dc_beep":['int16',['int16','uint']]
        });
        var st;
        var tt;
        var msg = "";
        var init_ret = rd.dc_init(100, 9600);
        if(init_ret <= 0)
        {
            msg+="dc init error";
            console.log(msg);
            return;
        }
        msg+="dc init ok";
        console.log(msg);
        rd.dc_config_card(init_ret,'A');

        var rbuff =ref.alloc('ulong');
        st = rd.dc_card(init_ret,'0', rbuff);
        if(st!=0)
        {
            msg+="dc card error </br>";
            rd.dc_exit(init_ret);
            console.log(msg);
            return;
        }
        msg+="dc card ok </br>";

        msg+="card id is : "+(rbuff.deref()+"</br>");

        console.log(msg);
        var rlen = ref.alloc('byte');
        var restBuff= ref.alloc('byte');
        st = rd.dc_pro_reset(init_ret,rlen,restBuff);
        if(st!=0)
        {
            msg+="dc pro reset error </br>";
            rd.dc_exit(init_ret);
            console.log(msg);
            return;
        }
        msg+="dc pro reset ok </br>";

        msg+="reset infomation : "+(restBuff.deref()+"</br>");
        console.log(msg);

        var slen = 10;
        var sbuff = ref.alloc("uchar", "0084000008");
        var commandLen = ref.alloc("uchar");
        var commandbuffer = ref.alloc("uchar");
        st =rd.dc_pro_command(init_ret,slen,sbuff,commandLen,commandbuffer,tt);
        if(st!=0)
        {
            msg+="get a random number error </br>";
            rd.dc_exit(init_ret);
            console.log(msg);
            return;
        }
        msg+="get a random number ok </br>";

        rd.dc_beep(init_ret,5);

        msg+=" the random number is "+commandbuffer.deref() + " </br>";
        console.log(msg);
        rd.dc_exit(init_ret);
        this.setState({
            userName:msg
        });
    }
}

const styles = {
    root: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: 100,
        height: 100,
        marginBottom: 40
    },
    buttons_container: {
        paddingTop: 30,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
};


let mainWndComponent = ReactDOM.render(
    <MainWindow />,
    document.getElementById('content'));