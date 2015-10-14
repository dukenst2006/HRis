<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers\Auth;

use HRis\Eloquent\Navlink;
use HRis\Http\Controllers\Controller;
use HRis\Http\Requests\SigninRequest;
use JWTAuth;

class AuthController extends Controller
{
    /**
     * Handles the login request.
     *
     * @param SigninRequest $request
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Bertrand Kintanar
     */
    public function signin(SigninRequest $request)
    {
        $response = [];
        try {
            $field = filter_var($request->get('email'), FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            $request->merge([$field => $request->get('email')]);
            // Grab credentials from the request.
            $credentials = $request->only($field, 'password');

            $claims = ['company' => 'HRis'];
            if ($request->has('remember')) {
                if ($request->get('remember') == true) {
                    $claims['exp'] = ''.strtotime('+1 year');
                }
            }
            // Attempt to verify the credentials and create a token for the user.
            if ($token = JWTAuth::attempt($credentials, $claims)) {
                $data = JWTAuth::toUser($token);

                $response['code'] = 200;
                $response['token'] = $token;
                $response['data'] = $data;
                $response['data']['employee_id'] = $data->employee->employee_id;
                $response['data']['sidebar'] = Navlink::sidebar($data);
            } else {
                $response['code'] = 422;
                $response['text'] = 'Invalid Credentials';
            }
        } catch (JWTException $e) {
            // Something went wrong whilst attempting to encode the token.
            $response['code'] = 500;
            $response['text'] = $e->getMessage();
        } catch (Exception $e) {
            // Server Error
            $response['code'] = 500;
            $response['text'] = $e->getMessage();
        }

        return response()->json($response);
    }
}
