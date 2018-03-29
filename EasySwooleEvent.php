<?php
/**
 * Created by PhpStorm.
 * User: yf
 * Date: 2018/1/9
 * Time: 下午1:04
 */

namespace EasySwoole;

use \EasySwoole\Core\AbstractInterface\EventInterface;
use \EasySwoole\Core\Swoole\ServerManager;
use \EasySwoole\Core\Swoole\EventRegister;
use \EasySwoole\Core\Http\Request;
use \EasySwoole\Core\Http\Response;

Class EasySwooleEvent implements EventInterface {

    public function frameInitialize(): void
    {
        // TODO: Implement frameInitialize() method.
        date_default_timezone_set('Asia/Shanghai');
    }

    public function mainServerCreate(ServerManager $server,EventRegister $register): void
    {
        // TODO: Implement mainServerCreate() method.
    }

    public function onRequest(Request $request,Response $response): void
    {
        $request->startTime = microtime(true);
    }

    public function afterAction(Request $request,Response $response): void
    {
        $statusCode = $response->getStatusCode();
        $codeColor = ['200'];
        if ($statusCode < 200){
            $codeColor = '34';
        }else if($statusCode < 300){
            $codeColor = '32';
        }else if($statusCode < 400){
            $codeColor = '33';
        }else {
            $codeColor = '31';
        }
        echo $request->getMethod();
        echo ' ' . parse_url($request->getUri())['path'];
        echo " \e[{$codeColor}m" . $statusCode . "\e[0m";
        echo ' ' . round((microtime(true) - $request->startTime) * 1000, 3) . "ms\n";
    }
}