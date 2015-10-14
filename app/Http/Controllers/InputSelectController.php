<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers;

use HRis\Eloquent\City;
use HRis\Eloquent\Country;
use HRis\Eloquent\Department;
use HRis\Eloquent\EducationLevel;
use HRis\Eloquent\EmploymentStatus;
use HRis\Eloquent\JobTitle;
use HRis\Eloquent\Location;
use HRis\Eloquent\MaritalStatus;
use HRis\Eloquent\Nationality;
use HRis\Eloquent\Province;
use HRis\Eloquent\Relationship;
use Illuminate\Http\Request;

class InputSelectController extends Controller
{
    public function __construct(City $city, Country $country, Department $department, EducationLevel $education_level, EmploymentStatus $employment_status, JobTitle $job_title, Location $location, MaritalStatus $marital_status, Nationality $nationality, Province $province, Relationship $relationship)
    {
        $this->city = $city;
        $this->country = $country;
        $this->department = $department;
        $this->education_level = $education_level;
        $this->employment_status = $employment_status;
        $this->job_title = $job_title;
        $this->location = $location;
        $this->marital_status = $marital_status;
        $this->nationality = $nationality;
        $this->province = $province;
        $this->relationship = $relationship;
    }

    public function cities(Request $request)
    {
        $province_id = $request->get('province_id');

        if (!$province_id) {
            return $this->xhr([]);
        }

        return $this->chosen($this->city->whereProvinceId($province_id));
    }

    public function countries(Request $request)
    {
        return $this->chosen($this->country);
    }

    public function departments(Request $request)
    {
        if ($request->get('table_view')) {
            return $this->xhr($this->department->lists('name', 'id'));
        }

        return $this->chosen($this->department);
    }

    public function educationLevels(Request $request)
    {
        if ($request->get('table_view')) {
            return $this->xhr($this->education_level->lists('name', 'id'));
        }

        return $this->chosen($this->education_level);
    }

    public function employmentStatuses(Request $request)
    {
        if ($request->get('table_view')) {
            return $this->xhr($this->employment_status->get(['id', 'name', 'class']));
        }

        return $this->chosen($this->employment_status, ['class']);
    }

    public function jobTitles(Request $request)
    {
        if ($request->get('table_view')) {
            return $this->xhr($this->job_title->lists('name', 'id'));
        }

        return $this->chosen($this->job_title);
    }

    public function locations(Request $request)
    {
        if ($request->get('table_view')) {
            return $this->xhr($this->location->lists('name', 'id'));
        }

        return $this->chosen($this->location);
    }

    public function maritalStatuses(Request $request)
    {
        return $this->chosen($this->marital_status);
    }

    public function nationalities(Request $request)
    {
        return $this->chosen($this->nationality);
    }

    public function provinces(Request $request)
    {
        return $this->chosen($this->province);
    }

    public function relationships(Request $request)
    {
        if ($request->get('table_view')) {
            return $this->xhr($this->relationship->lists('name', 'id'));
        }

        return $this->chosen($this->relationship);
    }

    protected function chosen($model, $custom_attributes = null)
    {
        $attributes = ['name', 'id'];

        if (is_array($custom_attributes)) {
            $attributes = array_merge(['name', 'id'], $custom_attributes);
        }

        $collection = $model->get($attributes);

        $chosen = [];
        foreach ($collection as $item) {
            if ($custom_attributes) {
                $chosen[] = ['text' => $item->name, 'value' => $item->id, 'class' => $item->class];
            } else {
                $chosen[] = ['text' => $item->name, 'value' => $item->id];
            }
        }

        return $this->xhr($chosen);
    }
}
