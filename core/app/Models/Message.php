<?php

namespace App\Models;

use App\Constants\Status;
use App\Traits\ApiQuery;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use ApiQuery;

    protected $casts = [
        'location'     => 'array',
        'list_reply'   => 'array',
        'product_data' => 'array'
    ];

    protected $fillable = ['campaign_id'];

    public function node()
    {
        return $this->belongsTo(FlowNode::class, 'flow_node_id', 'id');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id')
            ->where('is_agent', Status::YES);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function ctaUrl()
    {
        return $this->belongsTo(CtaUrl::class, 'cta_url_id');
    }

    public function interactiveList()
    {
        return $this->belongsTo(InteractiveList::class, 'interactive_list_id');
    }

    public function statusBadge(): Attribute
    {
        return new Attribute(function () {
            $html = '';

            if ($this->status == Status::SENT) {
                $html = '<i class="la la-check text--secondary"></i>';
            } elseif ($this->status == Status::DELIVERED) {
                $html = '<i class="la la-check-double text--secondary"></i>';
            } elseif ($this->status == Status::READ) {
                $html = '<i class="la la-check-double text--success"></i>';
            } else {
                if ($this->template) {
                    $html = '<span class="text--danger text--bold">' . trans('Failed') . '</span>';
                } else {
                    $html = '<i class="las la-redo-alt text--warning resender" data-id="' . e($this->id) . '"></i>';
                }
            }

            return $html;
        });
    }
}
