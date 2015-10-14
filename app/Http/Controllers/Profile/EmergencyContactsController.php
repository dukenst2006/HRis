<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers\Profile;

use HRis\Eloquent\EmergencyContact;
use HRis\Eloquent\Employee;
use HRis\Http\Controllers\Controller;
use HRis\Http\Requests\Profile\EmergencyContactsRequest;

/**
 * Class EmergencyContactsController.
 *
 * @Middleware("auth")
 */
class EmergencyContactsController extends Controller
{
    /**
     * @var Employee
     */
    protected $employee;

    /**
     * @var EmergencyContact
     */
    protected $emergency_contact;

    /**
     * @param Employee         $employee
     * @param EmergencyContact $emergency_contact
     *
     * @author Bertrand Kintanar
     */
    public function __construct(Employee $employee, EmergencyContact $emergency_contact)
    {
        $this->employee = $employee;
        $this->emergency_contact = $emergency_contact;
    }

    /**
     * Show the Profile - Emergency Contacts.
     *
     * @param EmergencyContactsRequest $request
     *
     * @return \Illuminate\View\View
     *
     * @author Bertrand Kintanar
     */
    public function index(EmergencyContactsRequest $request)
    {
        $employee = $this->employee->getEmployeeById($request->get('employee_id'), null);

        // TODO: recode this
        if (!$employee) {
            return response()->make(view()->make('errors.404'), 404);
        }

        return $this->xhr($employee);
    }

    /**
     * Save the Profile - Emergency Contacts.
     *
     * @param EmergencyContactsRequest $request
     *
     * @return \Illuminate\Http\RedirectResponse
     *
     * @author Bertrand Kintanar
     */
    public function store(EmergencyContactsRequest $request)
    {
        try {
            $attributes = array_filter($request->except('relationships', 'relationship'));
            $emergency_contact = $this->emergency_contact->create($attributes);
        } catch (Exception $e) {
            return $this->xhr(UNABLE_ADD_MESSAGE, 500);
        }

        return $this->xhr(['emergency_contact' => $emergency_contact, 'text' => SUCCESS_ADD_MESSAGE]);
    }

    /**
     * Update the Profile - Emergency Contacts.
     *
     * @param EmergencyContactsRequest $request
     *
     * @return \Illuminate\Http\RedirectResponse
     *
     * @author Bertrand Kintanar
     */
    public function update(EmergencyContactsRequest $request)
    {
        $emergency_contact = $this->emergency_contact->whereId($request->get('emergency_contact_id'))->first();

        if (!$emergency_contact) {
            return redirect()->to($request->path())->with('danger', UNABLE_RETRIEVE_MESSAGE);
        }

        try {
            $attributes = array_filter($request->except('relationships', 'relationship'));
            $emergency_contact->update($attributes);
        } catch (Exception $e) {
            return $this->xhr(UNABLE_UPDATE_MESSAGE, 500);
        }

        return $this->xhr(SUCCESS_UPDATE_MESSAGE);
    }

    /**
     * Delete the Profile - Emergency Contacts.
     *
     * @param EmergencyContactsRequest $request
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Bertrand Kintanar
     */
    public function destroy(EmergencyContactsRequest $request)
    {
        $emergency_contact_id = $request->get('id');

        try {
            $this->emergency_contact->whereId($emergency_contact_id)->delete();
        } catch (Exception $e) {
            return $this->xhr(UNABLE_DELETE_MESSAGE);
        }

        return $this->xhr(SUCCESS_DELETE_MESSAGE);
    }
}
