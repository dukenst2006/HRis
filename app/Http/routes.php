<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

/***** backend routes *****/
Route::group(['prefix'     => 'api/1.0'], function () {
    Route::group(['prefix' => 'auth', 'namespace' => 'Auth'], function () {
        Route::get('refresh', [
            'middleware' => [
                'before' => 'jwt.auth',
                'after'  => 'jwt.refresh',
            ],
            function () {
                return response()->json(['code' => 200, 'text' => 'Token refreshed']);
            },
        ]);
        Route::post('signin', 'AuthController@signin');
        Route::post('fbsignin', 'AuthController@fbSignin');
        Route::post('signup', 'AuthController@signup');

        Route::get('signout', ['middleware' => 'jwt.auth', 'uses' => 'AuthController@signout']);
    });

    Route::group(['prefix' => 'employee'], function () {
        Route::post('get-by-employee-id', [
            'middleware' => 'jwt.auth',
            'uses'       => 'EmployeeController@getByEmployeeId',
        ]);
    });

    // Menu
    Route::group(['prefix' => 'profile', 'namespace' => 'Profile'], function () {
        Route::patch('personal-details', [
            'middleware' => 'jwt.auth',
            'uses'       => 'PersonalDetailsController@update',
        ]);
        Route::patch('contact-details', [
            'middleware' => 'jwt.auth',
            'uses'       => 'PersonalDetailsController@update',
        ]);
        Route::get('emergency-contacts', [
            'middleware' => 'jwt.auth',
            'uses'       => 'EmergencyContactsController@index',
        ]);
        Route::post('emergency-contacts', [
            'middleware' => 'jwt.auth',
            'uses'       => 'EmergencyContactsController@store',
        ]);
        Route::patch('emergency-contacts', [
            'middleware' => 'jwt.auth',
            'uses'       => 'EmergencyContactsController@update',
        ]);
        Route::delete('emergency-contacts', [
            'middleware' => 'jwt.auth',
            'uses'       => 'EmergencyContactsController@destroy',
        ]);
        Route::get('dependents', [
            'middleware' => 'jwt.auth',
            'uses'       => 'DependentsController@index',
        ]);
        Route::post('dependents', [
            'middleware' => 'jwt.auth',
            'uses'       => 'DependentsController@store',
        ]);
        Route::patch('dependents', [
            'middleware' => 'jwt.auth',
            'uses'       => 'DependentsController@update',
        ]);
        Route::delete('dependents', [
            'middleware' => 'jwt.auth',
            'uses'       => 'DependentsController@destroy',
        ]);
        Route::patch('job', [
            'middleware' => 'jwt.auth',
            'uses'       => 'JobController@update',
        ]);
        Route::delete('job', [
            'middleware' => 'jwt.auth',
            'uses'       => 'JobController@destroy',
        ]);
        Route::group(['prefix' => 'qualifications'], function () {
            Route::post('work-experiences', [
                'middleware' => 'jwt.auth',
                'uses'       => 'QualificationsController@storeWorkExperience',
            ]);
            Route::delete('work-experiences', [
                'middleware' => 'jwt.auth',
                'uses'       => 'QualificationsController@destroyWorkExperience',
            ]);
            Route::patch('work-experiences', [
                'middleware' => 'jwt.auth',
                'uses'       => 'QualificationsController@updateWorkExperience',
            ]);
        });
    });

    Route::group(['prefix' => 'pim', 'namespace' => 'PIM'], function () {
        Route::get('employee-list', [
            'middleware' => 'jwt.auth',
            'uses'       => 'EmployeeListController@index',
        ]);
    });

    // Chosen
    Route::get('cities', ['uses' => 'InputSelectController@cities']);
    Route::get('countries', ['uses' => 'InputSelectController@countries']);
    Route::get('departments', ['uses' => 'InputSelectController@departments']);
    Route::get('education-levels', ['uses' => 'InputSelectController@educationLevels']);
    Route::get('employment-statuses', ['uses' => 'InputSelectController@employmentStatuses']);
    Route::get('job-titles', ['uses' => 'InputSelectController@jobTitles']);
    Route::get('locations', ['uses' => 'InputSelectController@locations']);
    Route::get('marital-statuses', ['uses' => 'InputSelectController@maritalStatuses']);
    Route::get('nationalities', ['uses' => 'InputSelectController@nationalities']);
    Route::get('provinces', ['uses' => 'InputSelectController@provinces']);
    Route::get('relationships', ['uses' => 'InputSelectController@relationships']);

    Route::post('sidebar', [
        'middleware' => 'jwt.auth',
        'uses'       => 'SidebarController@index',
    ]);

});

/***** frontend routes *****/
Route::get('/{subs?}', function () {
    return View::make('default');
})->where(['subs' => '.*']);
