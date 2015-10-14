<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers;

use HRis\Eloquent\Navlink;
use HRis\Facades\Sidebar;

class SidebarController extends Controller
{
    public function index()
    {
        $parent_links = Navlink::where('parent_id', 0)->get();

        $parent_links->each(function ($item) {
            $item->route = str_replace('/', '-', $item->href);
        })->toArray();

        return json_encode($this->getChildren($parent_links));
    }

    public function getChildren($children)
    {
        foreach ($children as $k => $child)
        {
            $grand_children = Navlink::where('parent_id', $child['id'])->get();

            $grand_children->each(function ($item) {
                $item->route = str_replace('/', '-', $item->href);
                unset($item);
            })->toArray();

            $grand_children->filter(function ($item) {
                return 0;
            });

            $children[$k]['children'] = $this->getChildren($grand_children);
        }

        return $children;
    }


}
