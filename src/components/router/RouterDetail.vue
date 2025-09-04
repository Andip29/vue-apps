<script setup>

</script>

<template>
  <div class="row">
							<div class="col">
								<section class="card">
									<header class="card-header">
										<div class="card-actions">
											<a href="#" class="card-action card-action-toggle" data-card-toggle></a>
											<a href="#" class="card-action card-action-dismiss" data-card-dismiss></a>
										</div>

										<h2 class="card-title">Multi-select</h2>
									</header>
									<div class="card-body">
										<form class="form-horizontal form-bordered" action="#">
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">Basic Multi-select</label>
												<div class="col-lg-6">
													<select class="form-control" multiple="multiple" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200 }' id="ms_example0">
														<option value="cheese">Cheese</option>
														<option value="tomatoes" selected>Tomatoes</option>
														<option value="mozarella" selected>Mozzarella</option>
														<option value="mushrooms">Mushrooms</option>
														<option value="pepperoni">Pepperoni</option>
														<option value="onions">Onions</option>
													</select>
												</div>
											</div>
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">Basic Multi-select (Only One)</label>
												<div class="col-lg-6">
													<select class="form-control" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200 }' id="ms_example1">
														<option value="cheese" selected>Cheese</option>
														<option value="tomatoes">Tomatoes</option>
														<option value="mozarella">Mozzarella</option>
														<option value="mushrooms">Mushrooms</option>
														<option value="pepperoni">Pepperoni</option>
														<option value="onions">Onions</option>
													</select>
												</div>
											</div>
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">With Preselected Options</label>
												<div class="col-lg-6">
													<select class="form-control" multiple="multiple" data-plugin-options='{ "maxHeight": 200 }' data-plugin-multiselect id="ms_example2">
														<option value="cheese" selected>Cheese</option>
														<option value="tomatoes" selected>Tomatoes</option>
														<option value="mozarella" selected>Mozzarella</option>
														<option value="mushrooms">Mushrooms</option>
														<option value="pepperoni">Pepperoni</option>
														<option value="onions">Onions</option>
													</select>
												</div>
											</div>
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">Link button</label>
												<div class="col-lg-6">
													<select class="form-control" multiple="multiple" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200, "buttonClass": "btn btn-link ps-0 pe-0" }' id="ms_example3">
														<option value="cheese">Cheese</option>
														<option value="tomatoes">Tomatoes</option>
														<option value="mozarella">Mozzarella</option>
														<option value="mushrooms">Mushrooms</option>
														<option value="pepperoni">Pepperoni</option>
														<option value="onions">Onions</option>
													</select>
												</div>
											</div>
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">With icon</label>
												<div class="col-lg-6">
													<div class="input-group input-group-select-append">
														<span class="input-group-text">
															<i class="fas fa-th-list"></i>
														</span>
														<select class="form-control" multiple="multiple" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200 }' id="ms_example4">
															<option value="cheese">Cheese</option>
															<option value="tomatoes">Tomatoes</option>
															<option value="mozarella">Mozzarella</option>
															<option value="mushrooms">Mushrooms</option>
															<option value="pepperoni">Pepperoni</option>
															<option value="onions">Onions</option>
														</select>
													</div>
												</div>
											</div>
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">Select All Option</label>
												<div class="col-lg-6">
													<select class="form-control" multiple="multiple" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200, "includeSelectAllOption": true }' id="ms_example5">
														<optgroup label="Mathematics">
															<option value="analysis">Analysis</option>
															<option value="algebra">Linear Algebra</option>
															<option value="discrete">Discrete Mathematics</option>
															<option value="numerical">Numerical Analysis</option>
															<option value="probability">Probability Theory</option>
														</optgroup>
														<optgroup label="Computer Science">
															<option value="programming">Introduction to Programming</option>
															<option value="automata">Automata Theory</option>
															<option value="complexity">Complexity Theory</option>
															<option value="software">Software Engineering</option>
														</optgroup>
													</select>
												</div>
											</div>
											<div class="form-group row pb-3">
												<label class="col-lg-3 control-label text-lg-end pt-2">With Search</label>
												<div class="col-lg-6">
													<select class="form-control" multiple="multiple" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200, "enableCaseInsensitiveFiltering": true }' id="ms_example6">
														<optgroup label="Mathematics">
															<option value="analysis">Analysis</option>
															<option value="algebra">Linear Algebra</option>
															<option value="discrete">Discrete Mathematics</option>
															<option value="numerical">Numerical Analysis</option>
															<option value="probability">Probability Theory</option>
														</optgroup>
														<optgroup label="Computer Science">
															<option value="programming">Introduction to Programming</option>
															<option value="automata">Automata Theory</option>
															<option value="complexity">Complexity Theory</option>
															<option value="software">Software Engineering</option>
														</optgroup>
													</select>
												</div>
											</div>
											<div class="form-group row pb-2">
												<label class="col-lg-3 control-label text-lg-end pt-2">Toggle All Button</label>
												<div class="col-lg-6">
													<div class="btn-group">
														<select class="form-control" multiple="multiple" data-plugin-multiselect data-plugin-options='{ "maxHeight": 200 }' data-multiselect-toggle-all="true" id="ms_example7">
															<option value="cheese">Cheese</option>
															<option value="tomatoes">Tomatoes</option>
															<option value="mozarella">Mozzarella</option>
															<option value="mushrooms">Mushrooms</option>
															<option value="pepperoni">Pepperoni</option>
															<option value="onions">Onions</option>
														</select>
													</div>
													<div class="btn-group me-2">
														<button id="ms_example7-toggle" class="btn btn-primary ms-2">Select All</button>
													</div>
												</div>
											</div>
										</form>
									</div>
								</section>
							</div>
						</div>
</template>

<style scoped>

</style>