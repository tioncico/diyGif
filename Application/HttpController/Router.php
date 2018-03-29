<?php
/**
 * Created by PhpStorm.
 * User: x
 * Date: 2018-03-28
 * Time: 11:33
 */

namespace App\HttpController;


use EasySwoole\Core\Http\Request;
use EasySwoole\Core\Http\Response;
use FastRoute\RouteCollector;

class Router extends \EasySwoole\Core\Http\AbstractInterface\Router
{

    function register(RouteCollector $routeCollector)
    {
        //获取gif动图中的某一帧
        $routeCollector->get( '/getImg/{gif_name}/{gif_index:\d+}','/index/getImg');
        //编辑动图页面
        $routeCollector->get( '/edit/{gif_name}','/edit/index');
        //保存编辑动图页面
        $routeCollector->post( '/edit/{gif_name}/save','/edit/save');
    }
}