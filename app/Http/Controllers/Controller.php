<?php

namespace HRis\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use JWTAuth;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * @var null
     */
    protected $logged_user = null;

    /**
     * @var mixed
     */
    protected $app_list_limit;

    /**
     * Check the logged user from the given token.
     */
    public function __construct()
    {
        $this->app_list_limit = env('APP_LIST_LIMIT', 50);
        $token = JWTAuth::getToken();
        if (!empty($token)) {
            $this->logged_user = JWTAuth::toUser($token);
        }
    }

    /**
     * @param $data
     * @param bool|int $codeOrPaginate
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function xhr($data, $codeOrPaginate = false)
    {
        $code = 200;
        $paginate = false;
        if (!is_bool($codeOrPaginate)) {
            $code = $codeOrPaginate;
        } else {
            $paginate = $codeOrPaginate;
        }
        $response = [];
        $response['code'] = $code;

        if ((is_object($data) || is_array($data)) && count($data) > 0) {
            if ($paginate) {
                $response['paginator'] = [
                    'total_count'  => $data->total(),
                    'total_pages'  => ceil($data->total() / $data->perPage()),
                    'current_page' => $data->currentPage(),
                    'limit'        => $data->count(),
                ];
                $data = $data->items();
            }
            $response['data'] = $data;
        } else {
            if (empty($data) || count($data) == 0) {
                $data = 'Empty result';
            }
            $response['text'] = $data;
        }

        $response['@meta'] = [
            'server_time'     => date('Y-m-d H:i:s'),
            'server_timezone' => date_default_timezone_get(),
            'api_version'     => '1.0',
            'execution_time'  => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], // PHP 5.4.0
        ];

        return response()->json($response);
    }
}
