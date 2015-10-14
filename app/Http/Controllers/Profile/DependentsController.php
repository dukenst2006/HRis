<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers\Profile;

use HRis\Eloquent\Dependent;
use HRis\Eloquent\Employee;
use HRis\Http\Controllers\Controller;
use HRis\Http\Requests\Profile\DependentsRequest;

/**
 * Class DependentsController.
 *
 * @Middleware("auth")
 */
class DependentsController extends Controller
{
    /**
     * @var Employee
     */
    protected $employee;

    /**
     * @var Dependent
     */
    protected $dependent;

    /**
     * @param Employee  $employee
     * @param Dependent $dependent
     *
     * @author Bertrand Kintanar
     */
    public function __construct(Employee $employee, Dependent $dependent)
    {
        $this->employee = $employee;
        $this->dependent = $dependent;
    }

    /**
     * Show the Profile - Dependents.
     *
     * @param DependentsRequest $request
     *
     * @return \Illuminate\View\View
     *
     * @author Bertrand Kintanar
     */
    public function index(DependentsRequest $request)
    {
        $employee = $this->employee->getEmployeeById($request->get('employee_id'), null);

        // TODO: recode this
        if (!$employee) {
            return response()->make(view()->make('errors.404'), 404);
        }

        return $this->xhr($employee);
    }

    /**
     * Save the Profile - Dependents.
     *
     * @param DependentsRequest $request
     *
     * @return \Illuminate\Http\RedirectResponse
     *
     * @author Bertrand Kintanar
     */
    public function store(DependentsRequest $request)
    {
        try {
            $attributes = array_filter($request->except('relationships', 'relationship'));
            $dependent = $this->dependent->create($attributes);
        } catch (Exception $e) {
            return $this->xhr(UNABLE_ADD_MESSAGE, 500);
        }

        return $this->xhr(['dependent' => $dependent, 'text' => SUCCESS_ADD_MESSAGE]);
    }

    /**
     * Update the Profile - Dependents.
     *
     * @param DependentsRequest $request
     *
     * @return \Illuminate\Http\RedirectResponse
     *
     * @author Bertrand Kintanar
     */
    public function update(DependentsRequest $request)
    {
        $dependent = $this->dependent->whereId($request->get('dependent_id'))->first();

        if (!$dependent) {
            return redirect()->to($request->path())->with('danger', UNABLE_RETRIEVE_MESSAGE);
        }

        try {
            $attributes = array_filter($request->except('relationships', 'relationship'));
            $dependent->update($attributes);
        } catch (Exception $e) {
            return $this->xhr(UNABLE_UPDATE_MESSAGE, 500);
        }

        return $this->xhr(SUCCESS_UPDATE_MESSAGE);
    }

    /**
     * Delete the Profile - Dependents.
     *
     * @param DependentsRequest $request
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Bertrand Kintanar
     */
    public function destroy(DependentsRequest $request)
    {
        $dependent_id = $request->get('id');

        try {
            $this->dependent->whereId($dependent_id)->delete();
        } catch (Exception $e) {
            return $this->xhr(UNABLE_DELETE_MESSAGE);
        }

        return $this->xhr(SUCCESS_DELETE_MESSAGE);
    }
}
