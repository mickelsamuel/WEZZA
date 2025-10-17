"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Eye, Edit, Plus, ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  subject: string;
  htmlContent: string;
  variables: string[] | null;
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/admin/email-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      const url = isCreating
        ? "/api/admin/email-templates"
        : `/api/admin/email-templates/${selectedTemplate.id}`;

      const method = isCreating ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTemplate),
      });

      if (response.ok) {
        toast.success(`Template ${isCreating ? "created" : "updated"} successfully!`);
        loadTemplates();
        setIsEditing(false);
        setIsCreating(false);
        setSelectedTemplate(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    }
  };

  const filteredTemplates = templates.filter((t) =>
    filterCategory === "all" ? true : t.category === filterCategory
  );

  const categories = ["all", "transactional", "marketing", "notification"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-gray-600 mt-1">Manage and customize email templates</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTemplate({
              id: "",
              key: "",
              name: "",
              description: "",
              subject: "",
              htmlContent: "",
              variables: [],
              category: "transactional",
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            setIsCreating(true);
            setIsEditing(true);
          }}
          className="bg-brand-orange hover:bg-brand-orange/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <Label>Category:</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first email template
            </p>
            <Button
              onClick={() => {
                setSelectedTemplate({
                  id: "",
                  key: "",
                  name: "",
                  description: "",
                  subject: "",
                  htmlContent: "",
                  variables: [],
                  category: "transactional",
                  active: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
                setIsCreating(true);
                setIsEditing(true);
              }}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant={template.active ? "default" : "secondary"}>
                    {template.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Subject:</p>
                    <p className="text-sm font-medium">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category:</p>
                    <Badge variant="outline" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditing(true);
                        setIsCreating(false);
                      }}
                      className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setIsCreating(false);
          setSelectedTemplate(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Create New Template" : "Edit Template"}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Create a new email template"
                : "Modify the email template details and content"}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={selectedTemplate.name}
                    onChange={(e) =>
                      setSelectedTemplate({ ...selectedTemplate, name: e.target.value })
                    }
                    placeholder="e.g., Order Confirmation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Template Key *</Label>
                  <Input
                    id="key"
                    value={selectedTemplate.key}
                    onChange={(e) =>
                      setSelectedTemplate({ ...selectedTemplate, key: e.target.value })
                    }
                    placeholder="e.g., order-confirmation"
                    disabled={!isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                  }
                  placeholder="e.g., Your Order #{{orderNumber}} is Confirmed!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedTemplate.description || ""}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      description: e.target.value,
                    })
                  }
                  placeholder="What is this template for?"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={selectedTemplate.category}
                    onValueChange={(value) =>
                      setSelectedTemplate({ ...selectedTemplate, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={selectedTemplate.active}
                      onChange={(e) =>
                        setSelectedTemplate({
                          ...selectedTemplate,
                          active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="active" className="font-normal">
                      Active
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Content *</Label>
                <Textarea
                  id="htmlContent"
                  value={selectedTemplate.htmlContent}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      htmlContent: e.target.value,
                    })
                  }
                  placeholder="Enter your HTML email template here..."
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Use {`{{variableName}}`} for dynamic content
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setSelectedTemplate(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-brand-orange hover:bg-brand-orange/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Preview - {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview of how the email will look when sent
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Subject:</p>
                <p className="text-base">{selectedTemplate.subject}</p>
              </div>
              <div className="border rounded-lg p-4 bg-white max-h-[60vh] overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
