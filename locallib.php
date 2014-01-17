<?php
// This file is part of the GPS free course format for Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

defined('MOODLE_INTERNAL') || die();

function format_gps_edit_icon($courseid, $sectionid) {
    global $OUTPUT, $PAGE;

    static $editstr = null;
    static $canedit = null;

    if (!$PAGE->user_is_editing()) {
        return '';
    }

    if ($canedit === null) {
        $context = context_course::instance($courseid);
        $canedit = has_capability('format/gps:editsection_geo', $context);
    }

    if (!$canedit) {
        return '';
    }

    if ($editstr === null) {
        $editstr = get_string('editsection_geo', 'format_gps');
    }

    $editurl = new moodle_url('/course/format/gps/geocoder.php', array('courseid' => $courseid, 'section' => $sectionid));
    $output = '';
    $icon = $OUTPUT->pix_icon('geo', $editstr, 'format_gps', array('title' => $editstr));
    $output .= html_writer::link($editurl, $icon, array('class' => 'format_gps_editsection_geo'));

    return $output;
}

function format_gps_add_javascript($courseid, $numsections) {
    global $PAGE;

    $jsmodule = array(
        'name' => 'format_gps',
        'fullpath' => new moodle_url('/course/format/gps/geo_map.js'),
        'strings' => array(array('format_gps'), array('format_gps'), array('cancel', 'core')),
        'requires' => array('node', 'event', 'panel')
    );
    $options = array('courseid' => $courseid, 'numsections' => $numsections);
    $PAGE->requires->js_init_call('M.geo_map.init', array($options), true, $jsmodule);
}

/**
 * Returns the 'GPS topic status' help icon
 *
 * @return string HTML code for help icon, or blank if not needed
 */
function format_gps_icon() {
    global $PAGE, $OUTPUT;

    $previewstr = get_string('gps_restricted', 'format_gps');

    $icon = $OUTPUT->pix_icon('geo', $previewstr, 'format_gps', array('title' => $previewstr));

    return $icon;
}

function format_gps_check_proximity($topic, $location) {

    $proximity = new stdClass();

    $locationlatitude = $topic->format_gps_latitude;
    $locationlongitude = $topic->format_gps_longitude;
    $locationradius = 50;
    $userlatitude = $location->latitude;
    $userlongitude = $location->longitude;
    $userlocation = new format_gps_haversine($userlatitude, $userlongitude, $locationlatitude, $locationlongitude);

    if ($userlocation->distance > $locationradius) {
        // User is to far away.
        $proximity->status = 'toofar';
    } else {
        // User is within allowed radius.
        $proximity->status = 'ok';
    }
    return $proximity;
}

// Based on C++ code by Jochen Topf <jochen@topf.org>
// See http://osmiumapi.openstreetmap.de/haversine_8hpp_source.html
// Translated into PHP and extended to cater for different distance units by Barry Oosthuizen
class format_gps_haversine {

    public $radius;
    public $distance;

    public function __construct($x1, $y1, $x2, $y2) {

        $this->radius = 6378100;
        $this->distance = $this->get_distance($x1, $y1, $x2, $y2);
    }

    public function get_distance($x1, $y1, $x2, $y2) {
        $lon_arc = deg2rad(($x1 - $x2));
        $lat_arc = deg2rad(($y1 - $y2));
        $lonh = sin($lon_arc * 0.5);
        $lonh *= $lonh;
        $lath = sin($lat_arc * 0.5);
        $lath *= $lath;
        $tmp = cos(deg2rad($y1)) * cos(deg2rad($y2));
        $distance = 2 * $this->radius * asin(sqrt($lath + $tmp * $lonh));
        return $distance;
    }

}
