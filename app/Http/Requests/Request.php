<?php

namespace HRis\Http\Requests;

use HRis\Eloquent\User;
use Illuminate\Foundation\Http\FormRequest;
use Tymon\JWTAuth\Facades\JWTAuth;

abstract class Request extends FormRequest
{
    public function __construct()
    {
        $this->app_list_limit = env('APP_LIST_LIMIT', 50);
        $token = JWTAuth::getToken();
        if (!empty($token)) {
            $user = JWTAuth::toUser($token);
            $this->logged_user = User::find($user->id);
        }
    }
    /**
     * @return mixed
     *
     * @author Bertrand Kintanar
     */
    public function forbiddenResponse()
    {
        return response()->make(view()->make('errors.403'), 403);
    }

    /**
     * Get the sort param.
     *
     * @return string
     *
     * @author Harlequin Doyon
     */
    public function sort()
    {
        return $this->get('sort') != '' ? $this->get('sort') : 'id';
    }

    /**
     * Get the direction param.
     *
     * @return string
     *
     * @author Harlequin Doyon
     */
    public function direction()
    {
        return $this->get('direction') != '' ? $this->get('direction') : 'asc';
    }

    /**
     * Get the pagination settings.
     *
     * @return array
     *
     * @author Harlequin Doyon
     */
    public function paginationSettings()
    {
        return ['path' => $this->path(), 'sort' => $this->sort(), 'direction' => $this->direction()];
    }
}
